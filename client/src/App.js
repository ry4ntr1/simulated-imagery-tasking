import React, { useRef, useState, useMemo } from "react";
import MapView from "./components/Map/MapView";
import ShareLinkModal from "./components/Modals/ShareLinkModal";
import DatasetSelectionModal from "./components/Modals/DatasetSelectionModal";
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

	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [showDatasetModal, setShowDatasetModal] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [rightPanelDatasets, setRightPanelDatasets] = useState([]);
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

	const zoomToDataset = (datasetName) => {
		setSelectedDataset(datasetName);
		const [datasetLat, datasetLng] = layer_metadata[datasetName].center;
		mapRef.current.setCenter([datasetLng, datasetLat]);
		mapRef.current.setZoom(15);

		setRightPanelDatasets([
			{
				name: datasetName,
				file: layer_metadata[datasetName].file,
				center: [datasetLat, datasetLng],
			},
		]);
		// Close dataset modal automatically when selected
		setShowDatasetModal(false);
	};

	const closeRightPanel = () => {
		setRightPanelDatasets([]);
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
					// Instantly teleport
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
	const filteredDatasets = useMemo(() => {
		if (!searchQuery.trim()) return [];
		const query = searchQuery.toLowerCase();
		return allDatasets.filter((datasetName) =>
			datasetName.toLowerCase().includes(query)
		);
	}, [searchQuery, allDatasets]);

	const buttonHeight = 32; // px
	const inputStyle = {
		border: `1px solid #412db5`,
		borderRadius: "3px",
		height: buttonHeight + "px",
		color: "#fff",
		backgroundColor: "#414344",
		padding: "0 8px",
		fontSize: "14px",
	};

	const buttonGroupStyle = {
		display: "flex",
		alignItems: "center",
		gap: "20px",
	};

	const containerStyle = {
		position: "absolute",
		top: "16px",
		left: "16px",
		zIndex: 10,
		display: "flex",
		alignItems: "center",
		gap: "20px",
		// no background container
	};

	const dropdownStyle = {
		position: "absolute",
		left: 0,
		right: 0,
		top: "100%",
		background: "#414344",
		border: "1px solid #412db5",
		borderRadius: "3px",
		overflow: "hidden",
		marginTop: "2px",
	};

	const dropdownItemStyle = {
		padding: "4px 8px",
		cursor: "pointer",
		color: "#fff",
		fontSize: "14px",
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
				setRightPanelDatasets={setRightPanelDatasets}
			/>

			<div style={containerStyle}>
				<div style={{ position: "relative" }}>
					<input
						type="text"
						style={inputStyle}
						placeholder="Search datasets..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					{filteredDatasets.length > 0 && (
						<div style={dropdownStyle}>
							{filteredDatasets.map((d) => (
								<div
									key={d}
									style={dropdownItemStyle}
									onClick={() => {
										zoomToDataset(d);
										setSearchQuery("");
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = "#412db5")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = "#414344")
									}
								>
									{d}
								</div>
							))}
						</div>
					)}
				</div>

				<div style={buttonGroupStyle}>
					<Button
						onClick={createShareableLink}
						iconClass="fas fa-link"
						ariaLabel="Share Link"
						height={buttonHeight}
						bg="#414344"
					/>
					<Button
						onClick={() => setShowDatasetModal(true)}
						iconClass="fas fa-list"
						ariaLabel="Select Dataset"
						height={buttonHeight}
						bg="#414344"
					/>
					<Button
						onClick={downloadDataset}
						iconClass="fas fa-download"
						ariaLabel="Download Dataset"
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
			</div>

			{showModal && (
				<ShareLinkModal
					shareableURL={shareableURL}
					onClose={() => setShowModal(false)}
					onCopy={copyToClipboard}
				/>
			)}

			{showDatasetModal && (
				<DatasetSelectionModal
					datasets={Object.keys(layer_metadata)}
					onClose={() => setShowDatasetModal(false)}
					onSelect={zoomToDataset}
				/>
			)}

			{showToast && <Toast message="Link copied to clipboard!" />}

			{rightPanelDatasets.length > 0 && (
				<div
					className="absolute top-0 right-0 h-full w-full sm:w-80 flex flex-col overflow-y-auto z-50"
					style={{
						backgroundColor: "#414344",
						color: "#fff",
						fontSize: "14px",
						padding: "16px",
						borderLeft: "1px solid #412db5",
						boxSizing: "border-box",
					}}
				>
					<div
						className="flex justify-between items-center border-b pb-2"
						style={{ borderColor: "#412db5" }}
					>
						{rightPanelDatasets.length > 1 ? (
							<h2 style={{ color: "#fff", fontSize: "24px", margin: 0 }}>
								Datasets Details
							</h2>
						) : (
							<h2 style={{ color: "#fff", fontSize: "24px", margin: 0 }}>
								Dataset Details
							</h2>
						)}
						<button
							onClick={closeRightPanel}
							aria-label="Close Panel"
							style={{
								color: "#fff",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								fontSize: "16px",
							}}
						>
							<i className="fas fa-times" />
						</button>
					</div>
					<div className="mt-4 space-y-4" style={{ marginTop: "16px" }}>
						{rightPanelDatasets.map((dataset) => (
							<div
								key={dataset.name}
								style={{
									border: "1px solid #412db5",
									borderRadius: "3px",
									backgroundColor: "#414344",
									color: "#fff",
									padding: "8px",
									textAlign: "left",
								}}
							>
								<h3
									style={{
										fontSize: "16px",
										fontStyle: "bold",
										margin: "0 0 4px 0",
									}}
								>
									{dataset.name}
								</h3>

								<p style={{ fontSize: "12px", margin: 0 }}>
									Lat: {dataset.center[0].toFixed(4)}, Lng:{" "}
									{dataset.center[1].toFixed(4)}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
