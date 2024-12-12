import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { layer_metadata } from "../../utils/layerMetadata";
import { createGeoJSONFromMetadata } from "../../utils/createGeoJSON";
import "mapbox-gl/dist/mapbox-gl.css";

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
	mapLoaded,
	setMapLoaded,
}) => {
	useEffect(() => {
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: mapRef.current?.container || "map",
				style: "mapbox://styles/mapbox/standard-satellite",
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
			});
		}
	}, [mapRef, lng, lat, zoom, setLng, setLat, setZoom, setMapLoaded]);

	// Update Tiles when dataset changes
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

		// Remove existing tile layers if present
		if (mapRef.current.getLayer("customTilesLayer")) {
			mapRef.current.removeLayer("customTilesLayer");
		}
		if (mapRef.current.getSource("customTiles")) {
			mapRef.current.removeSource("customTiles");
		}

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
		});
	}, [selectedDataset, mapLoaded, mapRef]);

	// Clustering
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

		// Remove old cluster layers/sources
		["clusters", "cluster-count", "unclustered-point"].forEach((layer) => {
			if (mapRef.current.getLayer(layer)) mapRef.current.removeLayer(layer);
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
			paint: {
				"text-color": "#ffffff",
			},
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

		mapRef.current.on("mouseenter", "clusters", () => {
			mapRef.current.getCanvas().style.cursor = "pointer";
		});
		mapRef.current.on("mouseleave", "clusters", () => {
			mapRef.current.getCanvas().style.cursor = "";
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
					mapRef.current.easeTo({
						center: features[0].geometry.coordinates,
						zoom: zoomLevel,
					});
				});
		});

		mapRef.current.on("click", "unclustered-point", (e) => {
			const coordinates = e.features[0].geometry.coordinates.slice();
			const { title } = e.features[0].properties;

			new mapboxgl.Popup()
				.setLngLat(coordinates)
				.setHTML(`<h3>${title}</h3>`)
				.addTo(mapRef.current);
		});
	}, [selectedDataset, mapLoaded, mapRef]);

	return <div id="map" className="w-full h-full" />;
};

export default MapView;
