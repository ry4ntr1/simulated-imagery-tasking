import React from "react";

const DatasetSelectionModal = ({ datasets, onClose, onSelect }) => {
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
					width: "40%",
				}}
			>
				<h2 style={{ fontSize: "24px", borderBottom: "1px solid #412db5" }}>
					Select a Dataset
				</h2>
				<ul
					style={{
						listStyle: "none",
						margin: 0,
						padding: 0,
						maxHeight: "400px",
						overflowY: "auto",

						fontSize: "18px",
					}}
				>
					{datasets.map((d) => (
						<li
							key={d}
							style={{ padding: "4px 8px", cursor: "pointer" }}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = "#412db5")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = "transparent")
							}
							onClick={() => {
								onSelect(d);
							}}
						>
							{d}
						</li>
					))}
				</ul>
				<button
					onClick={onClose}
					style={{
						borderRadius: "3px",
						background: "#412db5",
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
	);
};

export default DatasetSelectionModal;
