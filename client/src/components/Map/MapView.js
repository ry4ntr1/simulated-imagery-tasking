import React, { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { createGeoJSONFromMetadata } from "../../utils/createGeoJSON";
import { layer_metadata } from "../../utils/layerMetadata";
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
	setRightPanelDatasets,
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
			layout: {
				visibility: "visible",
			},
		});
	}, [selectedDataset, mapLoaded, mapRef]);

	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

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

		mapRef.current.on("click", "clusters", (e) => {
			const features = mapRef.current.queryRenderedFeatures(e.point, {
				layers: ["clusters"],
			});
			const clusterId = features[0].properties.cluster_id;

			mapRef.current
				.getSource("points")
				.getClusterLeaves(clusterId, Infinity, 0, (err, leafFeatures) => {
					if (err) {
						console.error("Error fetching cluster leaves:", err);
						return;
					}

					const datasetNames = leafFeatures.map((f) => f.properties.title);
					const datasetsInfo = datasetNames.map((name) => {
						const { file, center } = layer_metadata[name];
						return { name, file, center };
					});

					if (setRightPanelDatasets) {
						setRightPanelDatasets(datasetsInfo);
					}
				});

			mapRef.current
				.getSource("points")
				.getClusterExpansionZoom(clusterId, (err, zoomLevel) => {
					if (err) return;
					mapRef.current.easeTo({
						center: features[0].geometry.coordinates,
						zoom: zoomLevel,
						duration: 2000,
					});
				});
		});

		mapRef.current.on("click", "unclustered-point", (e) => {
			const coordinates = e.features[0].geometry.coordinates.slice();
			const { title } = e.features[0].properties;

			mapRef.current.easeTo({
				center: coordinates,
				zoom: 15,
				duration: 2000,
			});

			if (mapRef.current.getLayer("datasetLayer")) {
				mapRef.current.removeLayer("datasetLayer");
			}
			if (mapRef.current.getSource("datasetSource")) {
				mapRef.current.removeSource("datasetSource");
			}

			const datasetFile = layer_metadata[title].file;
			const datasetTilesUrl = `${process.env.REACT_APP_API_BASE_URL}/tiles/${datasetFile}/{z}/{x}/{y}.png`;

			mapRef.current.addSource("datasetSource", {
				type: "raster",
				tiles: [datasetTilesUrl],
				tileSize: 256,
				minzoom: 10,
				maxzoom: 25,
				scheme: "tms",
			});

			mapRef.current.addLayer({
				id: "datasetLayer",
				type: "raster",
				source: "datasetSource",
				layout: {
					visibility: "visible",
				},
			});

			const datasetCenter = layer_metadata[title].center;
			if (setRightPanelDatasets) {
				setRightPanelDatasets([
					{
						name: title,
						file: datasetFile,
						center: datasetCenter,
					},
				]);
			}
		});
	}, [selectedDataset, mapLoaded, mapRef, setRightPanelDatasets]);

	return (
		<div className="w-full h-full relative">
			<div id="map" className="w-full h-full" />
			{/* <div className="absolute bottom-4 left-4 z-10">
				<img
					src={`${process.env.REACT_APP_API_BASE_URL}/logo_small_purple.png`}
					alt="Custom Logo"
					className="h-8"
				/>
			</div> */}
		</div>
	);
};

export default MapView;