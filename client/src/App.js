import React, { useRef, useState, useMemo } from "react";
import MapView from "./components/Map/MapView";
import ShareLinkModal from "./components/Modals/ShareLinkModal";
import Toast from "./components/UI/Toast";
import Button from "./components/UI/Button";
import { layer_metadata } from "./utils/layerMetadata";
import { useURLParams } from "./hooks/useURLParams";

const App = () => {
	const { latParam, lngParam, zoomParam, datasetParam } = useURLParams();

	const [selectedDataset, setSelectedDataset] = useState(
		datasetParam || "DiamondValley"
	);
	const [lng, setLng] = useState(
		lngParam || layer_metadata["DiamondValley"].center[1]
	);
	const [lat, setLat] = useState(
		latParam || layer_metadata["DiamondValley"].center[0]
	);
	const [zoom, setZoom] = useState(zoomParam || 12);

	// Removed showDatasetModal and rightPanelDatasets related states
	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [tilesVisible, setTilesVisible] = useState(true);

	const mapRef = useRef(null);

	const createShareableLink = () => {
		if (!mapRef.current) return;
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const link = `${window.location.origin}/?Dataset=${selectedDataset}&Lat=${currentLat}&Lon=${currentLng}&Zoom=${currentZoom}`;
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

	const zoomToDataset = (datasetName) => {
		setSelectedDataset(datasetName);
		const [datasetLat, datasetLng] = layer_metadata[datasetName].center;
		mapRef.current.setCenter([datasetLng, datasetLat]);
		mapRef.current.setZoom(15);
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

	const goToCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					mapRef.current.setCenter([pos.coords.longitude, pos.coords.latitude]);
					mapRef.current.setZoom(15);
				},
				(err) => {
					console.error("Error retrieving location:", err);
				}
			);
		}
	};

	const allDatasets = Object.keys(layer_metadata);
	// Filter datasets based on search query
	const filteredDatasets = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return allDatasets;
		return allDatasets.filter((datasetName) =>
			datasetName.toLowerCase().includes(query)
		);
	}, [searchQuery, allDatasets]);

	// Styles
	const buttonHeight = 32; // px
	const inputStyle = {
		border: `1px solid #412db5`,
		borderRadius: "3px",
		height: buttonHeight + "px",
		color: "#fff",
		backgroundColor: "#414344",
		padding: "0 8px",
		fontSize: "14px",
		width: "100%",
		boxSizing: "border-box",
	};

	const leftPanelStyle = {
		position: "absolute",
		top: "16px",
		left: "16px",
		zIndex: 10,
		display: "flex",
		flexDirection: "column",
		width: "250px",
		backgroundColor: "#414344",
		border: "1px solid #412db5",
		borderRadius: "3px",
		padding: "16px",
		boxSizing: "border-box",
		gap: "8px",
	};

	const dividerStyle = {
		border: "none",
		borderTop: "1px solid #412db5",
		margin: "8px 0",
	};

	const datasetRowStyle = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		border: "1px solid #412db5",
		borderRadius: "3px",
		padding: "8px",
		marginBottom: "8px",
		boxSizing: "border-box",
		backgroundColor: "#414344",
		cursor: "pointer",
	};

	const datasetNameStyle = {
		color: "#fff",
		fontSize: "14px",
		margin: 0,
	};

	const datasetCoordStyle = {
		color: "#ccc",
		fontSize: "12px",
		margin: "4px 0 0 0",
	};

	const datasetInfoContainer = {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		flexGrow: 1,
		marginRight: "8px",
	};

	const buttonGroupStyle = {
		display: "flex",
		alignItems: "center",
		gap: "20px",
		position: "absolute",
		top: "16px",
		left: "290px", // moved these buttons slightly to the right of the left panel
		zIndex: 10,
	};

	return (
		<div className="relative w-full h-screen">
			<MapView
				mapRef={mapRef}
				lng={lng}
				lat={lat}
				zoom={zoom}
				setLng={setLng}
				setLat={setLat}
				setZoom={setZoom}
				selectedDataset={selectedDataset}
				mapLoaded={mapLoaded}
				setMapLoaded={setMapLoaded}
				// Removed setRightPanelDatasets since we're no longer using it
			/>

			{/* Left Panel */}
			<div style={leftPanelStyle}>
				{/* Search Bar */}
				<input
					type="text"
					style={inputStyle}
					placeholder="Search datasets..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<hr style={dividerStyle} />

				{/* Dataset Panel */}
				<div style={{ maxHeight: "60vh", overflowY: "auto" }}>
					{filteredDatasets.map((d) => {
						const { center } = layer_metadata[d];
						return (
							<div
								key={d}
								style={datasetRowStyle}
								onClick={() => zoomToDataset(d)}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "#412db5")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "#414344")
								}
							>
								<div style={datasetInfoContainer}>
									<p style={datasetNameStyle}>{d}</p>
									<p style={datasetCoordStyle}>
										Lat: {center[0].toFixed(4)}, Lng: {center[1].toFixed(4)}
									</p>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation(); // prevent triggering zoomToDataset
										downloadDataset(d);
									}}
									iconClass="fas fa-download"
									ariaLabel={`Download ${d}`}
									height={buttonHeight}
									bg="#414344"
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Top-Left Button Group (optional) */}
			<div style={buttonGroupStyle}>
				<Button
					onClick={createShareableLink}
					iconClass="fas fa-link"
					ariaLabel="Share Link"
					height={buttonHeight}
					bg="#414344"
				/>

				<Button
					onClick={toggleDatasetVisibility}
					iconClass={tilesVisible ? "fas fa-eye" : "fas fa-eye-slash"}
					ariaLabel="Toggle Dataset Visibility"
					height={buttonHeight}
					bg="#414344"
				/>
				<Button
					onClick={goToCurrentLocation}
					iconClass="fas fa-location-arrow"
					ariaLabel="Go to Current Location"
					height={buttonHeight}
					bg="#414344"
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
