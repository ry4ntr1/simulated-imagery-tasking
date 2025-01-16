// src/App.js
import React, { useRef, useState, useEffect, useMemo } from "react";
import TopNavBar from "./components/UI/TopNavBar";
import MapView from "./components/Map/MapView";
import DrawControls from "./components/Panel/DrawControls";
import PolygonCart from "./components/Panel/PolygonCart";
import PolygonNamingModal from "./components/UI/PolygonNamingModal";
import ShareLinkModal from "./components/UI/ShareLinkModal";
import Toast from "./components/UI/Toast";
import SearchBar from "./components/Panel/SearchBar";

import { useURLParams } from "./hooks/useURLParams";
import { layer_metadata } from "./utils/layerMetadata";
import { usePolygonManager } from "./utils/polygonManager";
import { getPolygonStaticImage } from "./utils/getPolygonStaticImage";

const App = () => {
	const { latParam, lngParam, zoomParam, datasetParam } = useURLParams();

	// --------------------------------------
	// Map location states
	// --------------------------------------
	const [selectedDataset, setSelectedDataset] = useState(datasetParam || null);
	const [lng, setLng] = useState(
		lngParam || layer_metadata["DiamondValley"].center[1]
	);
	const [lat, setLat] = useState(
		latParam || layer_metadata["DiamondValley"].center[0]
	);
	const [zoom, setZoom] = useState(zoomParam || 15);
	const [mapLoaded, setMapLoaded] = useState(false);

	// --------------------------------------
	// Searching states
	// --------------------------------------
	const [searchQuery, setSearchQuery] = useState("");
	const [placeResults, setPlaceResults] = useState([]);
	const [recentSearches, setRecentSearches] = useState([]);
	const [tilesVisible, setTilesVisible] = useState(true);

	// --------------------------------------
	// Share link
	// --------------------------------------
	const [showShareModal, setShowShareModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);

	// --------------------------------------
	// Cart
	// --------------------------------------
	const [cartOpen, setCartOpen] = useState(false);

	// --------------------------------------
	// Polygon drawing & management
	// --------------------------------------
	const {
		polygons,
		drawMode,
		setDrawMode,
		addPolygon,
		updatePolygon,
		removePolygon,
		renamePolygon,
	} = usePolygonManager();

	const [newPolygonFeature, setNewPolygonFeature] = useState(null);
	const [polygonCount, setPolygonCount] = useState(0);
	const [showNamingModal, setShowNamingModal] = useState(false);

	// Keep track of selected polygon
	const [selectedFeatureId, setSelectedFeatureId] = useState(null);

	// Refs & states for searching
	const mapRef = useRef(null);
	const [currentView, setCurrentView] = useState(null);

	// --------------------------------------
	// Searching logic
	// --------------------------------------
	useEffect(() => {
		if (searchQuery.length > 2) {
			(async () => {
				try {
					const response = await fetch(
						`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
							searchQuery
						)}.json?access_token=${
							process.env.REACT_APP_MAPBOX_TOKEN
						}&limit=5&autocomplete=true&fuzzyMatch=true&types=address,place,poi`
					);
					const data = await response.json();
					setPlaceResults(data.features || []);
				} catch (error) {
					console.error("Error fetching place results:", error);
					setPlaceResults([]);
				}
			})();
		} else {
			setPlaceResults([]);
		}
	}, [searchQuery]);

	const allDatasets = Object.keys(layer_metadata);
	const fullDatasetObjects = allDatasets.map((name) => ({
		name,
		metadata: layer_metadata[name],
	}));

	const filteredDatasets = useMemo(() => {
		if (!searchQuery.trim()) return fullDatasetObjects;
		return fullDatasetObjects.filter((d) =>
			d.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
		);
	}, [searchQuery, fullDatasetObjects]);

	// --------------------------------------
	// Handlers for dataset or place
	// --------------------------------------
	const onDatasetSelect = (datasetName) => {
		const [datasetLat, datasetLng] = layer_metadata[datasetName].center;
		if (mapRef.current) {
			mapRef.current.easeTo({
				center: [datasetLng, datasetLat],
				zoom: 14,
				duration: 300,
			});
		}
		setSelectedDataset(datasetName);
		const newView = {
			name: datasetName,
			lat: datasetLat,
			lng: datasetLng,
			zoom: 14,
		};
		updateViewAndPossiblyAddRecent(newView);
		setSearchQuery(datasetName);
	};

	const onPlaceSelect = (place) => {
		const [plng, plat] = place.center;
		if (mapRef.current) {
			mapRef.current.easeTo({
				center: [plng, plat],
				zoom: 14,
				duration: 300,
			});
		}
		setSelectedDataset(null);
		const newView = {
			name: place.place_name || place.text,
			lat: plat,
			lng: plng,
			zoom: 14,
		};
		updateViewAndPossiblyAddRecent(newView);
		setSearchQuery(place.place_name || place.text);
	};

	const onClearSearch = () => {
		updateViewAndPossiblyAddRecent(null);
		setSearchQuery("");
		setSelectedDataset(null);
	};

	const updateViewAndPossiblyAddRecent = (newView) => {
		if (currentView && (!newView || newView.name !== currentView.name)) {
			addOrReorderRecentSearch(currentView);
		}
		setCurrentView(newView);
	};

	const addOrReorderRecentSearch = (view) => {
		const existingIndex = recentSearches.findIndex((r) => r.name === view.name);
		if (existingIndex !== -1) {
			const updated = [...recentSearches];
			const [existingItem] = updated.splice(existingIndex, 1);
			updated.unshift(existingItem);
			setRecentSearches(updated);
		} else {
			setRecentSearches((prev) => [{ ...view, id: Date.now() }, ...prev]);
		}
	};

	const goToRecentSearch = (search) => {
		if (mapRef.current) {
			mapRef.current.easeTo({
				center: [search.lng, search.lat],
				zoom: search.zoom,
				duration: 300,
			});
		}
		setSearchQuery(search.name);
		if (layer_metadata[search.name]) {
			setSelectedDataset(search.name);
		} else {
			setSelectedDataset(null);
		}
		updateViewAndPossiblyAddRecent({
			name: search.name,
			lat: search.lat,
			lng: search.lng,
			zoom: search.zoom,
		});
	};

	const removeRecentSearch = (id) => {
		setRecentSearches((prev) => prev.filter((r) => r.id !== id));
	};

	// --------------------------------------
	// Share link
	// --------------------------------------
	const createShareableLink = () => {
		if (!mapRef.current) return;
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const link = `${window.location.origin}/share?lat=${currentLat}&lon=${currentLng}&zoom=${currentZoom}`;
		setShareableURL(link);
		setShowShareModal(true);
	};

	const copyToClipboard = () => {
		if (!shareableURL) return;
		navigator.clipboard
			.writeText(shareableURL)
			.then(() => {
				setShowToast(true);
				setShowShareModal(false);
				setTimeout(() => setShowToast(false), 2000);
			})
			.catch((err) => console.error("Failed to copy: ", err));
	};

	// --------------------------------------
	// Toggle tile visibility
	// --------------------------------------
	const toggleDatasetVisibility = () => {
		if (!mapRef.current) return;
		const layerId = "customTilesLayer";
		if (mapRef.current.getLayer(layerId)) {
			const currentVisibility = mapRef.current.getLayoutProperty(
				layerId,
				"visibility"
			);
			const newVisibility = currentVisibility === "none" ? "visible" : "none";
			mapRef.current.setLayoutProperty(layerId, "visibility", newVisibility);
			setTilesVisible(newVisibility === "visible");
		}
	};

	// --------------------------------------
	// Download dataset
	// --------------------------------------
	const downloadDataset = (datasetName) => {
		const datasetFile = layer_metadata[datasetName].file;
		const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/${datasetName}/${datasetFile}`;
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = datasetFile;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// --------------------------------------
	// Polygon creation logic
	// --------------------------------------
	const handlePolygonCreate = async (feature) => {
		setNewPolygonFeature(feature);
		setShowNamingModal(true);
	};

	const confirmPolygonName = async (name) => {
		let finalName = name;
		if (!finalName) {
			const nextCount = polygonCount + 1;
			finalName = `Area ${nextCount}`;
			setPolygonCount(nextCount);
		}

		const screenshotUrl = await getPolygonStaticImage(newPolygonFeature);

		const polygonWithMeta = {
			...newPolygonFeature,
			properties: {
				...newPolygonFeature.properties,
				name: finalName,
				screenshotUrl,
			},
		};
		addPolygon(polygonWithMeta);

		// Open cart, exit draw mode
		setCartOpen(true);
		setDrawMode(false);
		setShowNamingModal(false);
		setNewPolygonFeature(null);
	};

	const cancelPolygonName = async () => {
		await confirmPolygonName(null);
	};

	return (
		<div className="relative bg-[#1e1e1e] text-white min-h-screen overflow-hidden">
			<TopNavBar
				polygonCount={polygons.length}
				onCartClick={() => setCartOpen(!cartOpen)}
			/>

			<div
				className="relative w-full"
				style={{
					marginTop: "56px",
					height: "calc(100vh - 56px)",
					overflow: "hidden",
				}}
			>
				<MapView
					mapRef={mapRef}
					lng={lng}
					lat={lat}
					zoom={zoom}
					setLng={setLng}
					setLat={setLat}
					setZoom={setZoom}
					selectedDataset={selectedDataset}
					setSelectedDataset={setSelectedDataset}
					mapLoaded={mapLoaded}
					setMapLoaded={setMapLoaded}
					isMobile={false}
					drawMode={drawMode}
					onPolygonCreate={handlePolygonCreate}
					updatePolygon={(id, feat) => {
						setSelectedFeatureId(id);
						updatePolygon(id, feat);
					}}
					removePolygon={(id) => {
						removePolygon(id);
						if (id === selectedFeatureId) {
							setSelectedFeatureId(null);
						}
					}}
				/>

				<DrawControls
					drawMode={drawMode}
					setDrawMode={setDrawMode}
					tilesVisible={tilesVisible}
					onToggleVisibility={toggleDatasetVisibility}
					onShareLinkClick={createShareableLink}
					selectedDataset={selectedDataset}
					downloadDataset={downloadDataset}
				/>

				{/* Search bar, etc. */}
				<div
					style={{
						position: "absolute",
						top: "16px",
						left: "16px",
						zIndex: 2000,
						width: "320px",
						pointerEvents: "none",
					}}
				>
					<div style={{ pointerEvents: "auto" }}>
						<SearchBar
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							placeResults={placeResults}
							datasets={filteredDatasets}
							onDatasetSelect={onDatasetSelect}
							onPlaceSelect={onPlaceSelect}
							onClearSearch={onClearSearch}
							recentSearches={recentSearches}
							onClickRecentSearch={goToRecentSearch}
							onRemoveRecentSearch={removeRecentSearch}
							allDatasets={fullDatasetObjects}
						/>
					</div>
				</div>
			</div>

			<PolygonCart
				polygons={polygons}
				cartOpen={cartOpen}
				onCloseCart={() => setCartOpen(false)}
				removePolygon={removePolygon}
				renamePolygon={renamePolygon}
				updatePolygon={updatePolygon}
				mapRef={mapRef}
				selectedFeatureId={selectedFeatureId}
			/>

			{showShareModal && (
				<ShareLinkModal
					shareableURL={shareableURL}
					onClose={() => setShowShareModal(false)}
					onCopy={copyToClipboard}
				/>
			)}
			{showToast && <Toast message="Link copied to clipboard!" />}

			{showNamingModal && newPolygonFeature && (
				<PolygonNamingModal
					onConfirm={confirmPolygonName}
					onCancel={cancelPolygonName}
				/>
			)}
		</div>
	);
};

export default App;
