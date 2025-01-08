// MapView.js
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { createGeoJSONFromMetadata } from "../../utils/createGeoJSON";
import { length as turfLength } from "@turf/turf";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapView = ({
	mapRef,
	lng,
	lat,
	zoom,
	setLng,
	setLat,
	setZoom,
	selectedDataset,
	setSelectedDataset,
	mapLoaded,
	setMapLoaded,
	isMobile,
	drawMode,
	onPolygonCreate,
	updatePolygon,
	removePolygon,
	setIsPolygonSelected,
}) => {
	const drawControlRef = useRef(null);

	const [selectedFeatureId, setSelectedFeatureId] = useState(null);
	const [drawing, setDrawing] = useState(false);
	const [currentLineLength, setCurrentLineLength] = useState(0);

	// Initialize map once
	useEffect(() => {
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/satellite-streets-v12",
				center: [lng, lat],
				zoom: zoom,
			});

			mapRef.current.on("move", () => {
				setLng(mapRef.current.getCenter().lng.toFixed(4));
				setLat(mapRef.current.getCenter().lat.toFixed(4));
				setZoom(mapRef.current.getZoom().toFixed(2));
			});

			mapRef.current.on("load", () => {
				setMapLoaded(true);
				const tilesUrl = `${process.env.REACT_APP_API_BASE_URL}/tiles/vis/{z}/{x}/{y}.png`;
				mapRef.current.addSource("customTiles", {
					type: "raster",
					tiles: [tilesUrl],
					tileSize: 256,
					minzoom: 10,
					maxzoom: 25,
					scheme: "tms",
				});
				mapRef.current.addLayer({
					id: "customTilesLayer",
					type: "raster",
					source: "customTiles",
					layout: { visibility: "visible" },
				});
			});

			window.mapRef = mapRef.current;
		}
	}, [mapRef, lng, lat, zoom, setLng, setLat, setZoom, setMapLoaded]);

	// Clusters
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

		["clusters", "cluster-count", "unclustered-point"].forEach((layer) => {
			if (mapRef.current.getLayer(layer)) {
				mapRef.current.removeLayer(layer);
			}
		});
		if (mapRef.current.getSource("points")) {
			mapRef.current.removeSource("points");
		}

		const pointData = createGeoJSONFromMetadata();
		mapRef.current.addSource("points", {
			type: "geojson",
			data: pointData,
			cluster: true,
			clusterMaxZoom: 9,
			clusterRadius: 50,
		});

		// clusters
		mapRef.current.addLayer({
			id: "clusters",
			type: "circle",
			source: "points",
			filter: ["has", "point_count"],
			paint: {
				"circle-color": "#51bbd6",
				"circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
			},
			minzoom: 0,
			maxzoom: 9,
		});

		// cluster-count
		mapRef.current.addLayer({
			id: "cluster-count",
			type: "symbol",
			source: "points",
			filter: ["has", "point_count"],
			layout: {
				"text-field": "{point_count_abbreviated}",
				"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
				"text-size": 12,
			},
			paint: { "text-color": "#ffffff" },
			minzoom: 0,
			maxzoom: 9,
		});

		// unclustered-point
		mapRef.current.addLayer({
			id: "unclustered-point",
			type: "circle",
			source: "points",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": "#11b4da",
				"circle-radius": 5,
				"circle-stroke-width": 1,
				"circle-stroke-color": "#fff",
			},
			minzoom: 0,
			maxzoom: 10,
		});

		mapRef.current.on("click", "unclustered-point", (e) => {
			const feature = e.features[0];
			setSelectedDataset(feature.properties.title);
			const targetZoom = isMobile ? 12 : 14;
			mapRef.current.easeTo({
				center: feature.geometry.coordinates,
				zoom: targetZoom,
				duration: 300,
			});
		});

		mapRef.current.on("click", "clusters", (e) => {
			const features = mapRef.current.queryRenderedFeatures(e.point, {
				layers: ["clusters"],
			});
			const clusterId = features[0].properties.cluster_id;
			mapRef.current
				.getSource("points")
				.getClusterExpansionZoom(clusterId, (err, zoomLevel) => {
					if (err) return;
					const finalZoom = isMobile ? Math.min(zoomLevel, 12) : zoomLevel;
					mapRef.current.easeTo({
						center: features[0].geometry.coordinates,
						zoom: finalZoom,
						duration: 300,
					});
				});
		});
	}, [mapLoaded, isMobile, setSelectedDataset]);

	// Deselect dataset if zoom < 10
	useEffect(() => {
		if (!mapRef.current) return;
		const handleMoveEnd = () => {
			if (mapRef.current.getZoom() < 10 && selectedDataset) {
				setSelectedDataset(null);
			}
		};
		mapRef.current.on("moveend", handleMoveEnd);
		return () => {
			if (mapRef.current) {
				mapRef.current.off("moveend", handleMoveEnd);
			}
		};
	}, [selectedDataset, setSelectedDataset]);

	// Setup Mapbox Draw
	useEffect(() => {
		if (!mapRef.current) return;
		if (!drawControlRef.current) {
			drawControlRef.current = new MapboxDraw({
				displayControlsDefault: false,
				controls: {},
			});
			mapRef.current.addControl(drawControlRef.current, "bottom-left");

			mapRef.current.on("draw.create", handleDrawCreate);
			mapRef.current.on("draw.update", handleDrawUpdate);
			mapRef.current.on("draw.selectionchange", handleSelectionChange);
			mapRef.current.on("draw.render", handleDrawRender);
		}

		return () => {
			if (mapRef.current && drawControlRef.current) {
				mapRef.current.off("draw.create", handleDrawCreate);
				mapRef.current.off("draw.update", handleDrawUpdate);
				mapRef.current.off("draw.selectionchange", handleSelectionChange);
				mapRef.current.off("draw.render", handleDrawRender);
				mapRef.current.removeControl(drawControlRef.current);
				drawControlRef.current = null;
			}
		};
	}, []);

	// Toggle draw mode
	useEffect(() => {
		if (!drawControlRef.current) return;
		if (drawMode) {
			drawControlRef.current.changeMode("draw_polygon");
			setDrawing(true);
		} else {
			drawControlRef.current.changeMode("simple_select");
			setDrawing(false);
			setCurrentLineLength(0);
		}
	}, [drawMode]);

	const handleDrawCreate = (e) => {
		const feature = e.features[0];
		onPolygonCreate(feature);
		setDrawing(false);
		setCurrentLineLength(0);
	};

	const handleDrawUpdate = (e) => {
		const updatedFeature = e.features[0];
		updatePolygon(updatedFeature.id, updatedFeature);
	};

	const handleSelectionChange = (e) => {
		if (e.features && e.features.length > 0) {
			setSelectedFeatureId(e.features[0].id);
			setIsPolygonSelected(true);
		} else {
			setSelectedFeatureId(null);
			setIsPolygonSelected(false);
		}
	};

	const handleDrawRender = () => {
		if (!drawControlRef.current || !drawing) return;
		const data = drawControlRef.current.getAll();
		if (data.features.length) {
			const lastFeature = data.features[data.features.length - 1];
			if (lastFeature && lastFeature.geometry.type === "Polygon") {
				const perimeterMeters = turfLength(lastFeature, { units: "meters" });
				setCurrentLineLength(perimeterMeters);
			}
		}
	};

	// Expose delete function
	const deleteSelectedPolygon = () => {
		if (!drawControlRef.current || !selectedFeatureId) return;
		drawControlRef.current.delete(selectedFeatureId);
		removePolygon(selectedFeatureId);
		setSelectedFeatureId(null);
		setIsPolygonSelected(false);
	};
	window.deleteSelectedPolygon = deleteSelectedPolygon;

	return (
		<div className="relative w-full h-full overflow-hidden">
			<div id="map" className="w-full h-full" />

			{drawing && currentLineLength > 0 && (
				<div className="absolute top-24 left-5 bg-black/70 text-white rounded px-3 py-2 text-sm">
					<strong>Drawing…</strong>
					<br />
					Perimeter: {currentLineLength.toFixed(2)} m
				</div>
			)}
		</div>
	);
};

export default MapView;
