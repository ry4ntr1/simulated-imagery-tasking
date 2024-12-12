import React from "react";

const ShareLinkModal = ({ shareableURL, onClose, onCopy }) => {
	const handleBackdropClick = (e) => {
		if (e.target.id === "shareModalBackdrop") {
			onClose();
		}
	};

	return (
		<div
			id="shareModalBackdrop"
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
					onClick={onCopy}
					aria-label="Copy Link"
				>
					Copy Link
				</button>
			</div>
		</div>
	);
};

export default ShareLinkModal;
