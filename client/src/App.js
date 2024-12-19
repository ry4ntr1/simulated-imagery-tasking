// App.js (Modified)

import React, { useRef, useState, useMemo } from "react";
import MapView from "./components/Map/MapView";
import ShareLinkModal from "./components/Modals/ShareLinkModal";
import Toast from "./components/UI/Toast";
import Button from "./components/UI/Button";
import { layer_metadata } from "./utils/layerMetadata";
import { useURLParams } from "./hooks/useURLParams";

import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import VisibilityOffSharpIcon from "@mui/icons-material/VisibilityOffSharp";
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import ClearIcon from "@mui/icons-material/Clear";

import Tooltip from "@mui/material/Tooltip";

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
	const filteredDatasets = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return allDatasets;
		return allDatasets.filter((datasetName) =>
			datasetName.toLowerCase().includes(query)
		);
	}, [searchQuery, allDatasets]);

	const appContainerStyle = {
		width: "100%",
		height: "100vh",
		display: "flex",
		flexDirection: "row",
		backgroundColor: backgroundColor,
		color: textColor,
		fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
	};

	const leftPanelStyle = {
		width: "320px",
		backgroundColor: panelColor,
		display: "flex",
		flexDirection: "column",
		padding: "16px",
		boxSizing: "border-box",
		color: textColor,
		borderRight: `1px solid ${borderColor}`,
	};

	const inputContainerStyle = {
		display: "flex",
		gap: "8px",
		marginBottom: "12px",
	};

	const inputStyle = {
		border: `1px solid ${borderColor}`,
		borderRadius: "4px",
		height: "32px",
		color: textColor,
		backgroundColor: "#333",
		padding: "0 8px",
		fontSize: "14px",
		flex: 1,
		boxSizing: "border-box",
		transition: "border-color 0.2s",
	};

	const datasetContainerStyle = {
		flex: 1,
		overflowY: "auto",
		paddingRight: "4px",
	};

	const datasetRowStyle = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		border: `1px solid ${borderColor}`,
		borderRadius: "8px",
		padding: "12px",
		marginBottom: "12px",
		boxSizing: "border-box",
		backgroundColor: cardColor,
		cursor: "pointer",
		transition: "box-shadow 0.2s, background-color 0.2s",
		boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
	};

	const datasetInfoContainer = {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		flexGrow: 1,
		marginRight: "8px",
	};

	const datasetNameStyle = (d) => ({
		color: d === selectedDataset ? accentColor : "#fff",
		fontSize: "15px",
		margin: 0,
		fontWeight: d === selectedDataset ? "bold" : "500",
		lineHeight: 1.4,
	});

	const datasetCoordStyle = {
		color: "#ccc",
		fontSize: "12px",
		margin: "4px 0 0 0",
		whiteSpace: "nowrap",
	};

	const mapContainerStyle = {
		flex: 1,
		position: "relative",
	};

	const buttonContainerStyle = {
		position: "absolute",
		top: "16px",
		right: "16px",
		display: "flex",
		alignItems: "center",
		gap: "8px",
		zIndex: 10,
	};

	const navButtonsContainerStyle = {
		marginTop: "16px",
		display: "flex",
		justifyContent: "space-between",
	};

	// All buttons should be #412dba, so we set bg to accentColor and remove hover style changes
	const buttonBaseStyle = {
		backgroundColor: accentColor,
		border: "none",
		borderRadius: "4px",
		width: "32px",
		height: "32px",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	return (
		<div style={appContainerStyle}>
			{/* Left Panel */}
			<div style={leftPanelStyle}>
				{/* Search Bar */}
				<div style={inputContainerStyle}>
					<input
						type="text"
						style={inputStyle}
						placeholder="Search datasets..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
						onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
					/>
					{searchQuery && (
						<Tooltip title="Clear search" arrow>
							<div>
								<Button
									onClick={() => setSearchQuery("")}
									bg={accentColor}
									iconColor={textColor}
									icon={<ClearIcon />}
								/>
							</div>
						</Tooltip>
					)}
				</div>

				<div style={datasetContainerStyle}>
					{filteredDatasets.map((d) => {
						const { center } = layer_metadata[d];
						return (
							<div
								key={d}
								style={datasetRowStyle}
								onClick={() => zoomToDataset(d)}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = "#383838";
									e.currentTarget.style.boxShadow =
										"0px 2px 6px rgba(0,0,0,0.4)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = cardColor;
									e.currentTarget.style.boxShadow =
										"0px 1px 3px rgba(0,0,0,0.3)";
								}}
							>
								<div style={datasetInfoContainer}>
									<p style={datasetNameStyle(d)}>{d}</p>
									<p style={datasetCoordStyle}>Lat: {center[0].toFixed(4)}</p>
									<p style={datasetCoordStyle}>Lng: {center[1].toFixed(4)}</p>
								</div>
								<Tooltip title="Download dataset" arrow>
									<div>
										<Button
											onClick={(e) => {
												e.stopPropagation();
												downloadDataset(d);
											}}
											bg={accentColor}
											iconColor={textColor}
											icon={<DownloadSharpIcon />}
										/>
									</div>
								</Tooltip>
							</div>
						);
					})}
				</div>

				{/* Back/Forward Buttons at bottom */}
				<div style={navButtonsContainerStyle}>
					<div>
						{historyStack.length > 0 && (
							<Tooltip title="Go back" arrow>
								<button
									onClick={goBack}
									style={buttonBaseStyle}
									disabled={historyStack.length === 0}
								>
									<ArrowBackIosNewSharpIcon
										style={{ color: "#fff", fontSize: "16px" }}
									/>
								</button>
							</Tooltip>
						)}
					</div>
					<div>
						{forwardStack.length > 0 && (
							<Tooltip title="Go forward" arrow>
								<button
									onClick={goForward}
									style={buttonBaseStyle}
									disabled={forwardStack.length === 0}
								>
									<ArrowForwardIosSharpIcon
										style={{ color: "#fff", fontSize: "16px" }}
									/>
								</button>
							</Tooltip>
						)}
					</div>
				</div>
			</div>

			{/* Map Container */}
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
				/>

				{/* Buttons on top right */}
				<div style={buttonContainerStyle}>
					<Tooltip title="Get shareable link" arrow>
						<div>
							<Button
								onClick={createShareableLink}
								bg={accentColor}
								iconColor={textColor}
								icon={<LinkSharpIcon />}
							/>
						</div>
					</Tooltip>

					<Tooltip title="Toggle dataset visibility" arrow>
						<div>
							<Button
								onClick={toggleDatasetVisibility}
								bg={accentColor}
								iconColor={textColor}
								icon={
									tilesVisible ? (
										<VisibilitySharpIcon />
									) : (
										<VisibilityOffSharpIcon />
									)
								}
							/>
						</div>
					</Tooltip>
				</div>
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
