// MapView.js
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
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
}) => {
	const drawControlRef = useRef(null);

	const [drawing, setDrawing] = useState(false);
	const [currentLineLength, setCurrentLineLength] = useState(0);

	// Initialize map
	useEffect(() => {
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/satellite-streets-v12",
				center: [lng, lat],
				zoom,
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

			// store a global reference
			window.mapRef = mapRef.current;
		}
	}, [mapRef, lng, lat, zoom, setLng, setLat, setZoom, setMapLoaded]);

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
		// stop measuring perimeter
		setDrawing(false);
		setCurrentLineLength(0);
	};

	const handleDrawUpdate = (e) => {
		const updatedFeature = e.features[0];
		updatePolygon(updatedFeature.id, updatedFeature);
	};

	const handleSelectionChange = (e) => {
		// user can handle if they want
	};

	// measure line from last vertex to mouse while drawing
	const handleDrawRender = () => {
		if (!drawControlRef.current || !drawing) return;
		const data = drawControlRef.current.getAll();
		if (!data.features.length) return;

		const lastFeature = data.features[data.features.length - 1];
		if (lastFeature.geometry.type !== "Polygon") return;

		const coords = lastFeature.geometry.coordinates[0];
		if (coords.length > 1) {
			const secondToLast = coords[coords.length - 2];
			const lastCoord = coords[coords.length - 1];

			const lineSegment = {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: [secondToLast, lastCoord],
				},
			};
			const segmentLength = turfLength(lineSegment, { units: "meters" });
			setCurrentLineLength(segmentLength);
		}
	};

	// optional global function for map-based deletion
	window.deleteSelectedPolygon = () => {
		if (!drawControlRef.current) return;
		const selectedIds = drawControlRef.current.getSelectedIds();
		if (!selectedIds || !selectedIds.length) return;
		const featureId = selectedIds[0];
		drawControlRef.current.delete(featureId);
		removePolygon(featureId);
	};

	return (
		<div className="relative w-full h-full">
			<div id="map" className="w-full h-full" />

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
					}}
				>
					{`Segment length: ${currentLineLength.toFixed(2)} m`}
				</div>
			)}
		</div>
	);
};

export default MapView;
