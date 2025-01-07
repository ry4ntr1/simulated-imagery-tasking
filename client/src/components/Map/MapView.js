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
	// We'll store the Mapbox Draw instance here
	const drawControlRef = useRef(null);

	// Track which feature is currently selected
	const [selectedFeatureId, setSelectedFeatureId] = useState(null);

	// Track whether we're actively drawing a polygon
	const [drawing, setDrawing] = useState(false);
	// Track current line/perimeter length (meters) while drawing
	const [currentLineLength, setCurrentLineLength] = useState(0);

	// Initialize the map (once)
	useEffect(() => {
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/satellite-streets-v12",
				center: [lng, lat],
				zoom: zoom,
			});

			// track location
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

			// For debugging or direct reference
			window.mapRef = mapRef.current;
		}
	}, [mapRef, lng, lat, zoom, setLng, setLat, setZoom, setMapLoaded]);

	// Add or remove cluster layers
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

		// Remove any existing cluster layers
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

	// If zoom < 10, deselect dataset
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

	// -------------------------
	// Setup Mapbox Draw ONCE
	// -------------------------
	useEffect(() => {
		if (!mapRef.current) return;
		if (!drawControlRef.current) {
			drawControlRef.current = new MapboxDraw({
				displayControlsDefault: false,
				controls: {},
			});

			mapRef.current.addControl(drawControlRef.current, "bottom-left");

			// Event listeners
			mapRef.current.on("draw.create", handleDrawCreate);
			mapRef.current.on("draw.update", handleDrawUpdate);
			mapRef.current.on("draw.selectionchange", handleSelectionChange);
			mapRef.current.on("draw.render", handleDrawRender);
		}

		return () => {
			// cleanup if component unmounts
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

	// -------------------------
	// Toggle Draw Mode
	// -------------------------
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

	// -------------------------
	// Handler: draw.create
	// -------------------------
	const handleDrawCreate = (e) => {
		const feature = e.features[0];
		onPolygonCreate(feature);

		// Stop measuring perimeter once the shape is completed
		setDrawing(false);
		setCurrentLineLength(0);

		// If you want continuous polygon drawing, you could re-enable it:
		// setTimeout(() => {
		//   drawControlRef.current.changeMode("draw_polygon");
		//   setDrawing(true);
		// }, 0);
	};

	// -------------------------
	// Handler: draw.update
	// -------------------------
	const handleDrawUpdate = (e) => {
		const updatedFeature = e.features[0];
		updatePolygon(updatedFeature.id, updatedFeature);
	};

	// -------------------------
	// Handler: draw.selectionchange
	// -------------------------
	const handleSelectionChange = (e) => {
		if (e.features && e.features.length > 0) {
			setSelectedFeatureId(e.features[0].id);
			setIsPolygonSelected(true);
		} else {
			setSelectedFeatureId(null);
			setIsPolygonSelected(false);
		}
	};

	// -------------------------
	// Handler: draw.render
	//  -> measure partial perimeter while drawing
	// -------------------------
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

	// Expose a global function so DrawControls can call "deleteSelectedPolygon"
	const deleteSelectedPolygon = () => {
		if (!drawControlRef.current || !selectedFeatureId) return;
		drawControlRef.current.delete(selectedFeatureId);
		removePolygon(selectedFeatureId);
		setSelectedFeatureId(null);
		setIsPolygonSelected(false);
	};
	window.deleteSelectedPolygon = deleteSelectedPolygon;

	return (
		<div style={{ width: "100%", height: "100%", position: "relative" }}>
			<div id="map" style={{ width: "100%", height: "100%" }} />

			{drawing && currentLineLength > 0 && (
				<div
					style={{
						position: "absolute",
						top: 100,
						left: 20,
						padding: "6px 10px",
						backgroundColor: "rgba(0,0,0,0.7)",
						color: "#fff",
						borderRadius: "4px",
						fontSize: "14px",
					}}
				>
					<strong>Drawing…</strong>
					<br />
					Perimeter: {currentLineLength.toFixed(2)} m
				</div>
			)}
		</div>
	);
};

export default MapView;
