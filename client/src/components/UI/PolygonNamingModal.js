// PolygonNamingModal.js
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "../UI/Button";

const PolygonNamingModal = ({ onConfirm, onCancel }) => {
	const [inputValue, setInputValue] = useState("");

	const backgroundColor = "#222";
	const borderColor = "#333";

	const modalStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		backgroundColor,
		border: `1px solid ${borderColor}`,
		borderRadius: "8px",
		padding: "16px",
		color: "#fff",
		width: "300px",
	};

	const handleConfirm = () => {
		onConfirm(inputValue.trim());
	};

	return (
		<Modal
			open
			onClose={onCancel}
			closeAfterTransition
			BackdropProps={{
				style: { backgroundColor: "rgba(0,0,0,0.3)" },
			}}
		>
			<Fade in timeout={300}>
				<div style={modalStyle}>
					<h2 style={{ marginTop: 0 }}>Name Your Polygon</h2>
					<p style={{ color: "#aaa", marginBottom: "8px" }}>
						Enter a custom name or skip:
					</p>
					<input
						type="text"
						placeholder="Polygon name..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						style={{
							width: "100%",
							marginBottom: "8px",
							borderRadius: "4px",
							padding: "8px",
							border: `1px solid #444`,
							backgroundColor: "#333",
							color: "#fff",
						}}
					/>
					<div
						style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
					>
						<Button text="Skip" bg="#555" onClick={onCancel} />
						<Button text="Confirm" onClick={handleConfirm} />
					</div>
				</div>
			</Fade>
		</Modal>
	);
};

export default PolygonNamingModal;
