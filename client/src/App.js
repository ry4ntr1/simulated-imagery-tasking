import React, { useRef, useState, useMemo, useEffect } from "react";
import MapView from "./components/Map/MapView";
import ShareLinkModal from "./components/UI/ShareLinkModal";
import Toast from "./components/UI/Toast";
import { layer_metadata } from "./utils/layerMetadata";
import { useURLParams } from "./hooks/useURLParams";
import SearchBar from "./components/Panel/SearchBar";
import DatasetList from "./components/Panel/DatasetList";
import BackForwardControls from "./components/Panel/BackForwardControls";
import MapControls from "./components/Panel/MapControls";

import MenuIcon from "@mui/icons-material/Menu";

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

	const mapRef = useRef(null);

	const [historyStack, setHistoryStack] = useState([]);
	const [forwardStack, setForwardStack] = useState([]);

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth >= 768) {
				setMobilePanelOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const backgroundColor = "#1e1e1e";
	const panelColor = "#262626";
	const cardColor = "#2f2f2f";
	const accentColor = "#412dba";
	const textColor = "#fff";
	const borderColor = "#333";

	const createShareableLink = () => {
		if (!mapRef.current) return;
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const link = `${window.location.origin}/?Dataset=${selectedDataset || ""}&Lat=${currentLat}&Lon=${currentLng}&Zoom=${currentZoom}`;
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

	const pushViewState = () => {
		setHistoryStack((prev) => [...prev, { lat, lng, zoom, selectedDataset }]);
		setForwardStack([]);
	};

	const goBack = () => {
		if (historyStack.length > 0) {
			const currentState = { lat, lng, zoom, selectedDataset };
			setForwardStack((prev) => [...prev, currentState]);

			const prevState = historyStack[historyStack.length - 1];
			setHistoryStack((prev) => prev.slice(0, -1));

			setSelectedDataset(prevState.selectedDataset);
			if (mapRef.current) {
				mapRef.current.setCenter([prevState.lng, prevState.lat]);
				mapRef.current.setZoom(Number(prevState.zoom));
			}
		}
	};

	const goForward = () => {
		if (forwardStack.length > 0) {
			const currentState = { lat, lng, zoom, selectedDataset };
			setHistoryStack((prev) => [...prev, currentState]);

			const nextState = forwardStack[forwardStack.length - 1];
			setForwardStack((prev) => prev.slice(0, -1));

			setSelectedDataset(nextState.selectedDataset);
			if (mapRef.current) {
				mapRef.current.setCenter([nextState.lng, nextState.lat]);
				mapRef.current.setZoom(Number(nextState.zoom));
			}
		}
	};

	const zoomToDataset = (datasetName) => {
		pushViewState();
		setSelectedDataset(datasetName);
		const [datasetLat, datasetLng] = layer_metadata[datasetName].center;
		if (mapRef.current) {
			mapRef.current.easeTo({
				center: [datasetLng, datasetLat],
				zoom: 14,
				duration: 300,
			});
		}
		if (isMobile) {
			setMobilePanelOpen(false);
		}
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

	const appContainerStyle = {
		width: "100%",
		height: "100vh",
		display: isMobile ? "block" : "flex",
		flexDirection: isMobile ? "column" : "row",
		backgroundColor: backgroundColor,
		color: textColor,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		position: "relative",
	};

	const leftPanelWidth = isMobile ? "280px" : "320px";

	const leftPanelStyle = {
		width: leftPanelWidth,
		backgroundColor: panelColor,
		display: "flex",
		flexDirection: "column",
		padding: "16px",
		boxSizing: "border-box",
		color: textColor,
		borderRight: isMobile ? "none" : `1px solid ${borderColor}`,
		position: isMobile ? "fixed" : "relative",
		top: 0,
		left: 0,
		bottom: 0,
		zIndex: 2000,
		transform:
			isMobile && !mobilePanelOpen ? "translateX(-100%)" : "translateX(0)",
		transition: "transform 0.3s ease-in-out",
		overflowY: "auto",
	};

	const mobileMenuButtonStyle = {
		position: "absolute",
		top: "16px",
		left: "16px",
		backgroundColor: accentColor,
		border: "none",
		borderRadius: "4px",
		width: "32px",
		height: "32px",
		cursor: "pointer",
		display: isMobile ? "flex" : "none",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 3000,
	};

	const mapContainerStyle = {
		flex: 1,
		position: "relative",
		width: isMobile ? "100%" : "auto",
		height: isMobile ? "100vh" : "auto",
	};

	return (
		<div style={appContainerStyle}>
			{isMobile && (
				<button
					onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
					style={mobileMenuButtonStyle}
				>
					<MenuIcon style={{ color: "#fff", fontSize: "20px" }} />
				</button>
			)}

			<div style={leftPanelStyle}>
				<SearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					accentColor={accentColor}
					textColor={textColor}
					borderColor={borderColor}
					isMobile={isMobile}
				/>

				<DatasetList
					datasets={filteredDatasets}
					selectedDataset={selectedDataset}
					onDatasetClick={zoomToDataset}
					downloadDataset={downloadDataset}
					cardColor={cardColor}
					accentColor={accentColor}
					borderColor={borderColor}
				/>

				<BackForwardControls
					canGoBack={historyStack.length > 0}
					canGoForward={forwardStack.length > 0}
					onGoBack={goBack}
					onGoForward={goForward}
					accentColor={accentColor}
					textColor={textColor}
				/>
			</div>

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
					setSelectedDataset={(d) => {
						if (d !== selectedDataset) {
							pushViewState();
						}
						setSelectedDataset(d);
					}}
					mapLoaded={mapLoaded}
					setMapLoaded={setMapLoaded}
					isMobile={isMobile}
				/>

				<MapControls
					accentColor={accentColor}
					textColor={textColor}
					onShareLinkClick={createShareableLink}
					onToggleVisibility={toggleDatasetVisibility}
					tilesVisible={tilesVisible}
				/>
			</div>

			{showModal && (
				<ShareLinkModal
					shareableURL={shareableURL}
					onClose={() => setShowModal(false)}
					onCopy={copyToClipboard}
				/>
			)}

			{showToast && <Toast message="Link copied to clipboard!" />}
		</div>
	);
};

export default App;
