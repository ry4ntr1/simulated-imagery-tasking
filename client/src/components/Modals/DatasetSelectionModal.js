import React from "react";

const DatasetSelectionModal = ({ datasets, onClose, onSelect }) => {
  const handleBackdropClick = (e) => {
    if (e.target.id === "datasetModalBackdrop") {
      onClose();
    }
  };

  return (
    <div
      id="datasetModalBackdrop"
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50"></div>
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-0 left-1 text-gray-500 hover:text-gray-700 text-md"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 mt-4">Select Dataset</h2>
        <ul className="list-group">
          {datasets.map((dataset) => (
            <li key={dataset} className="mb-2">
              <button
                className="text-[#412db5] font-bold py-2 px-2 w-full text-left"
                onClick={() => onSelect(dataset)}
              >
                {dataset.split(/(?=[A-Z])/).join(" ")}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DatasetSelectionModal;
