// src/components/Map/MapView.js
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

	// track if we're drawing a polygon
	const [drawing, setDrawing] = useState(false);
	// measure partial line
	const [currentLineLength, setCurrentLineLength] = useState(0);

	// track selected polygon ID => handle ESC & DEL
	const [selectedFeatureId, setSelectedFeatureId] = useState(null);

	// Initialize map once
	useEffect(() => {
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/satellite-streets-v12",
				center: [lng, lat],
				zoom,
			});

			mapRef.current.on("move", () => {
				setLng(mapRef.current.getCenter().lng.toFixed(4));
				setLat(mapRef.current.getCenter().lat.toFixed(4));
				setZoom(mapRef.current.getZoom().toFixed(2));
			});

			mapRef.current.on("load", () => {
				setMapLoaded(true);
				// example tile layer
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

				// For debugging
				window.mapRef = mapRef.current;
			});
		}
	}, [mapRef, lng, lat, zoom, setLng, setLat, setZoom, setMapLoaded]);

	// Setup Mapbox Draw once
	useEffect(() => {
		if (!mapRef.current) return;
		if (!drawControlRef.current) {
			drawControlRef.current = new MapboxDraw({
				displayControlsDefault: false,
				controls: {},
			});
			mapRef.current.addControl(drawControlRef.current, "bottom-left");

			// Expose globally for cart usage
			window.drawControlRef = drawControlRef;

			// Register events
			mapRef.current.on("draw.create", handleDrawCreate);
			mapRef.current.on("draw.update", handleDrawUpdate);
			mapRef.current.on("draw.selectionchange", handleSelectionChange);
			mapRef.current.on("draw.render", handleDrawRender);
		}

		// Cleanup
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

	// Listen for ESC / DEL
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!selectedFeatureId || !drawControlRef.current) return;

			// If user pressed ESC => unselect
			if (e.key === "Escape") {
				drawControlRef.current.changeMode("simple_select");
				setSelectedFeatureId(null);
			}
			// If user pressed DEL => remove from map + state
			if (e.key === "Delete" || e.key === "Backspace") {
				drawControlRef.current.delete(selectedFeatureId);
				removePolygon(selectedFeatureId);
				setSelectedFeatureId(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedFeatureId, removePolygon]);

	// Toggle draw mode from props
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

	// Create => pass new polygon to parent
	const handleDrawCreate = (e) => {
		const feature = e.features[0];
		onPolygonCreate(feature);
		setDrawing(false);
		setCurrentLineLength(0);
	};

	// Update => user changed polygon
	const handleDrawUpdate = (e) => {
		const updatedFeature = e.features[0];
		updatePolygon(updatedFeature.id, updatedFeature);
	};

	// Selection => track the selected polygon ID
	const handleSelectionChange = (e) => {
		if (!e.features || e.features.length === 0) {
			setSelectedFeatureId(null);
		} else {
			setSelectedFeatureId(e.features[0].id);
		}
	};

	// measure partial lines
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

	return (
		<div className="relative w-full h-full">
			<div id="map" className="w-full h-full" />

			{drawMode && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0,0,0,0.1)", // subtle overlay
						pointerEvents: "none", // let user still interact with map
						zIndex: 9999,
					}}
				/>
			)}

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
