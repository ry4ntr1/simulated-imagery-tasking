import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const layer_metadata = {
	Coalhurst: { center: [49.7663487, -112.9621883], file: "Coalhurst.tif" },
	DiamondValley: {
		center: [50.690811, -114.3276151],
		file: "DiamondValley.tif",
	},
	JumpingPound: {
		center: [51.1447007, -114.5803002],
		file: "JumpingPound.tif",
	},
	Mossleigh: { center: [50.7213585, -113.3170537], file: "Mossleigh.tif" },
	Priddis: { center: [50.8971137, -114.2257905], file: "Priddis.tif" },
	SpyHill: { center: [51.1769612, -114.2115897], file: "SpyHill.tif" },
	WaterValley: { center: [51.53558, -114.6893865], file: "WaterValley.tif" },
	WeedLake: { center: [51.0116526, -113.6743955], file: "WeedLake.tif" },
};

// Create a GeoJSON FeatureCollection from layer_metadata
const createGeoJSONFromMetadata = () => {
	const features = Object.keys(layer_metadata).map((name) => {
		const coords = layer_metadata[name].center; // [lat, lng]
		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [coords[1], coords[0]], // GeoJSON is [lng, lat]
			},
			properties: {
				title: name,
			},
		};
	});

	return {
		type: "FeatureCollection",
		features,
	};
};

const App = () => {
	const mapContainerRef = useRef(null);
	const mapRef = useRef(null);

	// Initial Window Params
	const [lng, setLng] = useState(-97.7431);
	const [lat, setLat] = useState(30.2672);
	const [zoom, setZoom] = useState(12);

	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [selectedDataset, setSelectedDataset] = useState("DiamondValley");
	const [showDatasetModal, setShowDatasetModal] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);

	const inputRef = useRef(null); // Reference to the input field

	const getURLParams = () => {
		const params = new URLSearchParams(window.location.search);
		return {
			latParam: parseFloat(params.get("Lat")),
			lngParam: parseFloat(params.get("Lon")),
			zoomParam: parseFloat(params.get("Zoom")),
			datasetParam: params.get("Dataset"),
		};
	};

	useEffect(() => {
		// Get URL Parameters
		const { latParam, lngParam, zoomParam, datasetParam } = getURLParams();

		// Get Values from URL Parameters or Default Values
		const initialDataset = datasetParam || selectedDataset;
		const initialLng = lngParam || layer_metadata[initialDataset].center[1];
		const initialLat = latParam || layer_metadata[initialDataset].center[0];
		const initialZoom = zoomParam || zoom;

		// Set Initial States' Values
		setSelectedDataset(initialDataset);
		setLng(initialLng);
		setLat(initialLat);
		setZoom(initialZoom);

		// If Map Not Yet Initialized
		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/standard-satellite",
				center: [initialLng, initialLat], // Initial Center [lng, lat]
				zoom: initialZoom,
			});

			// Update State On Move
			mapRef.current.on("move", () => {
				setLng(mapRef.current.getCenter().lng.toFixed(4));
				setLat(mapRef.current.getCenter().lat.toFixed(4));
				setZoom(mapRef.current.getZoom().toFixed(2));
			});

			// When the map is loaded
			mapRef.current.on("load", () => {
				setMapLoaded(true);
			});
		}
	}, []); // Run once on mount

	// Function to create a shareable link
	const createShareableLink = () => {
		if (!mapRef.current) return;

		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const shareableLink = `${window.location.origin}/?Dataset=${selectedDataset}&Lat=${currentLat}&Lon=${currentLng}&Zoom=${currentZoom}`;
		setShareableURL(shareableLink);
		setShowModal(true);
	};

	// Function to copy link
	const copyToClipboard = () => {
		if (!shareableURL) return;

		navigator.clipboard
			.writeText(shareableURL)
			.then(() => {
				setShowToast(true);
				setShowModal(false);
				setTimeout(() => setShowToast(false), 2000);
			})
			.catch((err) => console.error("Failed to copy: ", err));
	};

	// Modal close handler
	const handleModalClose = (e) => {
		if (e.target.id === "shareModalBackdrop") {
			setShowModal(false);
		} else if (e.target.id === "datasetModalBackdrop") {
			setShowDatasetModal(false);
		}
	};

	// Download dataset
	const downloadDataset = () => {
		const datasetFile = layer_metadata[selectedDataset].file;
		const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/${selectedDataset}/${datasetFile}`;

		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = datasetFile;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Add tile layer when map and dataset loaded
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

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
	}, [selectedDataset, mapLoaded]);

	// Function to zoom to dataset
	const zoomToDataset = (dataset) => {
		setSelectedDataset(dataset);
		const [lat, lng] = layer_metadata[dataset].center;
		const center = [lng, lat];

		mapRef.current.setCenter(center);
		mapRef.current.setZoom(15);
		setShowDatasetModal(false);
	};

	const showDatasetSelection = () => {
		setShowDatasetModal(true);
	};

	// Create cluster source and layers from the metadata
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;

		// Remove old layers/source if they exist
		if (mapRef.current.getLayer("clusters")) {
			mapRef.current.removeLayer("clusters");
		}
		if (mapRef.current.getLayer("cluster-count")) {
			mapRef.current.removeLayer("cluster-count");
		}
		if (mapRef.current.getLayer("unclustered-point")) {
			mapRef.current.removeLayer("unclustered-point");
		}
		if (mapRef.current.getSource("points")) {
			mapRef.current.removeSource("points");
		}

		const pointData = createGeoJSONFromMetadata();

		mapRef.current.addSource("points", {
			type: "geojson",
			data: pointData,
			cluster: true,
			clusterMaxZoom: 9, // Clusters only show below zoom 10
			clusterRadius: 50,
		});

		// Clusters layer (only visible below zoom level 10)
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

		// Cluster count layer (text on clusters)
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

		// Unclustered points layer (individual datasets)
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
			maxzoom: 10, // Hide these at zoom 10+ as well
		});

		// Change cursor over clusters
		mapRef.current.on("mouseenter", "clusters", () => {
			mapRef.current.getCanvas().style.cursor = "pointer";
		});
		mapRef.current.on("mouseleave", "clusters", () => {
			mapRef.current.getCanvas().style.cursor = "";
		});

		// Zoom into a cluster on click
		mapRef.current.on("click", "clusters", (e) => {
			const features = mapRef.current.queryRenderedFeatures(e.point, {
				layers: ["clusters"],
			});
			const clusterId = features[0].properties.cluster_id;
			mapRef.current
				.getSource("points")
				.getClusterExpansionZoom(clusterId, (err, zoom) => {
					if (err) return;
					mapRef.current.easeTo({
						center: features[0].geometry.coordinates,
						zoom: zoom,
					});
				});
		});

		// Popup for individual points if clicked (when unclustered)
		mapRef.current.on("click", "unclustered-point", (e) => {
			const coordinates = e.features[0].geometry.coordinates.slice();
			const { title } = e.features[0].properties;

			new mapboxgl.Popup()
				.setLngLat(coordinates)
				.setHTML(`<h3>${title}</h3>`)
				.addTo(mapRef.current);
		});
	}, [selectedDataset, mapLoaded]);

	return (
		<div className="relative w-full h-screen">
			{/* Map container */}
			<div ref={mapContainerRef} className="w-full h-full" />

			{/* Action buttons */}
			<div className="absolute top-4 left-4 flex space-x-2">
				{/* Shareable Link Button */}
				<button
					className="text-[#412db5] border border-[#412db5] fas fa-link bg-white px-2 py-2 rounded shadow-lg"
					onClick={createShareableLink}
					aria-label="Share Link"
				></button>

				{/* Dataset Selection Button */}
				<button
					className="text-[#412db5] border border-[#412db5] fas fa-list bg-white px-2 py-2 rounded shadow-lg"
					onClick={showDatasetSelection}
					aria-label="Select Dataset"
				></button>

				{/* Download Dataset Button */}
				<button
					className="text-[#412db5] border border-[#412db5] fas fa-download bg-white px-2 py-2 rounded shadow-lg"
					onClick={downloadDataset}
					aria-label="Download Dataset"
				></button>
			</div>

			{/* Shareable Link Modal */}
			{showModal && (
				<div
					id="shareModalBackdrop"
					className="fixed inset-0 flex items-center justify-center z-50"
					onClick={handleModalClose}
				>
					<div className="absolute inset-0 bg-gray-600 bg-opacity-50"></div>
					<div
						className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-0 left-1 text-gray-500 hover:text-gray-700 text-md"
							onClick={() => setShowModal(false)}
							aria-label="Close Modal"
						>
							&times;
						</button>
						<h2 className="text-lg font-bold mb-4 mt-4">Shareable Link</h2>
						<div className="overflow-x-auto">
							<input
								type="text"
								readOnly
								value={shareableURL}
								className="w-full p-2 border border-gray-300 rounded-lg mb-2"
								style={{ whiteSpace: "nowrap", overflowX: "auto" }}
								onFocus={(e) => e.target.select()}
							/>
						</div>
						<button
							className="text-[#412db5] font-bold py-2 px-2"
							onClick={copyToClipboard}
							aria-label="Copy Link"
						>
							Copy Link
						</button>
					</div>
				</div>
			)}

			{/* Dataset Selection Modal */}
			{showDatasetModal && (
				<div
					id="datasetModalBackdrop"
					className="fixed inset-0 flex items-center justify-center z-50"
					onClick={handleModalClose}
				>
					<div className="absolute inset-0 bg-gray-600 bg-opacity-50"></div>
					<div
						className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-0 left-1 text-gray-500 hover:text-gray-700 text-md"
							onClick={() => setShowDatasetModal(false)}
							aria-label="Close Modal"
						>
							&times;
						</button>
						<h2 className="text-lg font-bold mb-4 mt-4">Select Dataset</h2>
						<ul className="list-group">
							{Object.keys(layer_metadata).map((dataset) => (
								<li key={dataset} className="mb-2">
									<button
										className="text-[#412db5] font-bold py-2 px-2 w-full text-left"
										onClick={() => zoomToDataset(dataset)}
									>
										{dataset.split(/(?=[A-Z])/).join(" ")}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Toast notification for link copied */}
			{showToast && (
				<div className="fixed bottom-4 right-4 bg-[#412db5] text-white py-2 px-4 rounded-lg shadow-lg z-50">
					Link copied to clipboard!
				</div>
			)}
		</div>
	);
};

export default App;
