import React from "react";

const ShareLinkModal = ({ shareableURL, onClose, onCopy }) => {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 9999,
			}}
		>
			<div
				style={{
					background: "#262624",
					padding: "20px",
					borderRadius: "3px",
					color: "#fff",
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				<h2 style={{ fontSize: "16px" }}>Shareable Link</h2>
				<input
					type="text"
					value={shareableURL}
					readOnly
					style={{
						width: "100%",

						borderRadius: "3px",
						background: "#181818",
						color: "#fff",
						height: "32px",
						padding: "0 8px",
					}}
				/>
				<div style={{ display: "flex", gap: "10px" }}>
					<button
						onClick={onCopy}
						style={{
							borderRadius: "3px",
							background: "#412db5",
							color: "#fff",
							padding: "0 8px",
							height: "32px",
							cursor: "pointer",
						}}
					>
						Copy
					</button>
					<button
						onClick={onClose}
						style={{
							border: "1px solid #412db5",
							borderRadius: "3px",
							background: "transparent",
							color: "#fff",
							padding: "0 8px",
							height: "32px",
							cursor: "pointer",
						}}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default ShareLinkModal;
