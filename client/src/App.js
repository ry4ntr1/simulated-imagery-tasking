import React, { useRef, useState } from "react";
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

	// State for datasets displayed in right panel (single dataset or cluster datasets)
	const [rightPanelDatasets, setRightPanelDatasets] = useState([]);

	// Track visibility of the custom tiles layer
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

	const zoomToDataset = (dataset) => {
		setSelectedDataset(dataset);
		const [datasetLat, datasetLng] = layer_metadata[dataset].center;
		mapRef.current.setCenter([datasetLng, datasetLat]);
		mapRef.current.setZoom(15);
		setShowDatasetModal(false);
	};

	const closeRightPanel = () => {
		setRightPanelDatasets([]);
	};

	// Toggle the visibility of the custom tiles layer
	const toggleTilesVisibility = () => {
		if (!mapRef.current || !mapLoaded) return;

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

			<div className="absolute top-4 left-4 flex space-x-2 z-10">
				<Button
					onClick={createShareableLink}
					iconClass="fas fa-link"
					ariaLabel="Share Link"
				/>
				<Button
					onClick={() => setShowDatasetModal(true)}
					iconClass="fas fa-list"
					ariaLabel="Select Dataset"
				/>
				<Button
					onClick={downloadDataset}
					iconClass="fas fa-download"
					ariaLabel="Download Dataset"
				/>
				<Button
					onClick={toggleTilesVisibility}
					iconClass={tilesVisible ? "fas fa-eye" : "fas fa-eye-slash"}
					ariaLabel="Toggle Tiles Visibility"
				/>
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

			{/* Right Panel for single or multiple datasets */}
			{rightPanelDatasets.length > 0 && (
				<div className="absolute top-0 right-0 h-full w-full sm:w-80 bg-white shadow-xl p-4 flex flex-col overflow-y-auto z-50">
					<div className="flex justify-between items-center border-b pb-2">
						{rightPanelDatasets.length > 1 ? (
							<h2 className="text-xl font-bold">Cluster Datasets</h2>
						) : (
							<h2 className="text-xl font-bold">Dataset Details</h2>
						)}
						<button
							onClick={closeRightPanel}
							className="text-gray-500 hover:text-gray-800"
							aria-label="Close Panel"
						>
							<i className="fas fa-times" />
						</button>
					</div>
					<div className="mt-4 space-y-4">
						{rightPanelDatasets.map((dataset) => (
							<div
								key={dataset.name}
								className="border rounded p-2 flex flex-col items-center space-y-2"
							>
								<h3 className="font-semibold text-center">{dataset.name}</h3>
								<p className="text-sm text-gray-600">File: {dataset.file}</p>
								<p className="text-sm text-gray-600">
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
