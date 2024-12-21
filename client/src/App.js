// App.js
import React, { useRef, useState, useMemo, useEffect } from "react";
import MapView from "./components/Map/MapView";
import ShareLinkModal from "./components/UI/ShareLinkModal";
import Toast from "./components/UI/Toast";
import { layer_metadata } from "./utils/layerMetadata";
import { useURLParams } from "./hooks/useURLParams";
import SearchBar from "./components/Panel/SearchBar";
import MapControls from "./components/Panel/MapControls";
import { usePolygonManager } from "./utils/polygonManager";
import PolygonOrderModal from "./components/UI/PolygonOrderModal";
import Button from "./components/UI/Button";
import PolygonCart from "./components/Panel/PolygonCart"; // <-- New component

const App = () => {
	const { latParam, lngParam, zoomParam, datasetParam } = useURLParams();

	const [selectedDataset, setSelectedDataset] = useState(datasetParam || null);
	const [lng, setLng] = useState(
		lngParam || layer_metadata["DiamondValley"].center[1]
	);
	const [lat, setLat] = useState(
		latParam || layer_metadata["DiamondValley"].center[0]
	);
	const [zoom, setZoom] = useState(zoomParam || 15);

	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [tilesVisible, setTilesVisible] = useState(true);

	const [placeResults, setPlaceResults] = useState([]);
	const [recentSearches, setRecentSearches] = useState([]);
	const mapRef = useRef(null);

	// currentView represents the currently displayed location/dataset
	const [currentView, setCurrentView] = useState(null);

	// ---------------------------
	// Integrate Polygon Manager
	// ---------------------------
	const {
		polygons,
		drawMode,
		setDrawMode,
		addPolygon,
		updatePolygon,
		removePolygon,
		renamePolygon,
	} = usePolygonManager();

	// Polygon Order Modal
	const [orderModalOpen, setOrderModalOpen] = useState(false);

	const handleOpenOrderModal = () => {
		setOrderModalOpen(true);
	};

	const handleCloseOrderModal = () => {
		setOrderModalOpen(false);
	};

	const handleSubmitOrder = (notes) => {
		console.log("Ordering polygons:", polygons, "with notes:", notes);
		setOrderModalOpen(false);
		// Possibly show a toast or loading indicator
	};

	useEffect(() => {
		if (searchQuery.length > 2) {
			const fetchPlaces = async () => {
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
			};
			fetchPlaces();
		} else {
			setPlaceResults([]);
		}
	}, [searchQuery]);

	const backgroundColor = "#1e1e1e";
	const accentColor = "#412dba";
	const textColor = "#fff";
	const borderColor = "#333";
	const overlayWidth = "320px";

	const appContainerStyle = {
		width: "100%",
		height: "100vh",
		backgroundColor,
		color: textColor,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		position: "relative",
		overflow: "hidden",
	};

	const mapContainerStyle = {
		width: "100%",
		height: "100%",
		position: "relative",
	};

	const overlayContainerStyle = {
		position: "absolute",
		top: "16px",
		left: "16px",
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		pointerEvents: "none",
		zIndex: 2000,
		width: overlayWidth,
	};

	const overlayBlockStyle = {
		pointerEvents: "auto",
		width: "100%",
		boxSizing: "border-box",
	};

	const createShareableLink = () => {
		if (!mapRef.current) return;
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const link = `${window.location.origin}/?Dataset=${
			selectedDataset || ""
		}&Lat=${currentLat}&Lon=${currentLng}&Zoom=${currentZoom}`;
		setShareableURL(link);
		setShowModal(true);
	};

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

	const allDatasets = Object.keys(layer_metadata);
	const fullDatasetObjects = allDatasets.map((name) => ({
		name,
		metadata: layer_metadata[name],
	}));

	const filteredDatasets = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return fullDatasetObjects;
		return fullDatasetObjects.filter((d) =>
			d.name.toLowerCase().includes(query)
		);
	}, [searchQuery, fullDatasetObjects]);

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

	const onClearSearch = () => {
		updateViewAndPossiblyAddRecent(null);
		setSearchQuery("");
		setSelectedDataset(null);
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

	return (
		<div style={appContainerStyle}>
			{/* Main Map Container */}
			<div style={mapContainerStyle}>
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
				/>

				{/* Bottom Center Controls */}
				<MapControls
					accentColor={accentColor}
					textColor={textColor}
					onShareLinkClick={createShareableLink}
					onToggleVisibility={toggleDatasetVisibility}
					tilesVisible={tilesVisible}
					selectedDataset={selectedDataset}
					downloadDataset={downloadDataset}
					drawMode={drawMode}
					setDrawMode={setDrawMode}
				/>

				{/* Left-Side Search Overlay */}
				<div style={overlayContainerStyle}>
					<div style={overlayBlockStyle}>
						<SearchBar
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							placeResults={placeResults}
							datasets={filteredDatasets}
							onDatasetSelect={onDatasetSelect}
							onPlaceSelect={onPlaceSelect}
							onClearSearch={onClearSearch}
							accentColor={accentColor}
							textColor={textColor}
							borderColor={borderColor}
							isMobile={false}
							recentSearches={recentSearches}
							onClickRecentSearch={goToRecentSearch}
							onRemoveRecentSearch={removeRecentSearch}
							allDatasets={fullDatasetObjects} // show all when no query
						/>
					</div>
				</div>

				{/* Button to open PolygonOrderModal */}
				<div
					style={{
						position: "absolute",
						bottom: "16px",
						right: "16px",
						zIndex: 2000,
					}}
				>
					<Button onClick={handleOpenOrderModal} text="Order Imagery" />
				</div>
			</div>

			{/* Polygon Cart (Right side) */}
			<PolygonCart
				polygons={polygons}
				removePolygon={removePolygon}
				renamePolygon={renamePolygon}
			/>

			{/* Polygon Order Modal */}
			<PolygonOrderModal
				isOpen={orderModalOpen}
				onClose={handleCloseOrderModal}
				polygons={polygons}
				onSubmitOrder={handleSubmitOrder}
			/>

			{/* Share Link Modal */}
			{showModal && (
				<ShareLinkModal
					shareableURL={shareableURL}
					onClose={() => setShowModal(false)}
					onCopy={copyToClipboard}
				/>
			)}

			{/* Toast */}
			{showToast && <Toast message="Link copied to clipboard!" />}
		</div>
	);
};

export default App;
