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
    datasetParam || "DiamondValley",
  );
  const [lng, setLng] = useState(
    lngParam || layer_metadata["DiamondValley"].center[1],
  );
  const [lat, setLat] = useState(
    latParam || layer_metadata["DiamondValley"].center[0],
  );
  const [zoom, setZoom] = useState(zoomParam || 12);

  const [showModal, setShowModal] = useState(false);
  const [shareableURL, setShareableURL] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      />

      <div className="absolute top-4 left-4 flex space-x-2">
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
    </div>
  );
};

export default App;
