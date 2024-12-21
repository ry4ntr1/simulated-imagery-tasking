// PolygonOrderModal.js
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "../UI/Button";

const PolygonOrderModal = ({ isOpen, onClose, polygons, onSubmitOrder }) => {
	const [notes, setNotes] = useState("");

	// Always call useState before any early returns
	if (!isOpen) return null;

	const backgroundColor = "#222222";
	const textColor = "#fff";
	const borderColor = "#333333";

	const modalContainerStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		backgroundColor: backgroundColor,
		border: `1px solid ${borderColor}`,
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
		padding: "16px",
		width: "400px",
		boxSizing: "border-box",
		color: textColor,
	};

	const titleStyle = {
		margin: "0 0 12px 0",
		fontSize: "16px",
		fontWeight: "bold",
		color: textColor,
	};

	const descriptionStyle = {
		fontSize: "14px",
		marginBottom: "12px",
		color: "#ccc",
	};

	const polygonListStyle = {
		maxHeight: "200px",
		overflowY: "auto",
		marginBottom: "12px",
		border: `1px solid ${borderColor}`,
		borderRadius: "4px",
		padding: "8px",
		backgroundColor: "#2a2a2a",
	};

	const polygonItemStyle = {
		background: "#333333",
		borderRadius: "4px",
		padding: "8px",
		marginBottom: "8px",
		boxSizing: "border-box",
	};

	const notesLabelStyle = {
		display: "block",
		marginBottom: "4px",
		fontSize: "14px",
		color: "#ccc",
	};

	const textAreaStyle = {
		width: "100%",
		height: "50px",
		borderRadius: "4px",
		border: `1px solid ${borderColor}`,
		fontSize: "14px",
		backgroundColor: "#2a2a2a",
		color: textColor,
		padding: "4px",
		outline: "none",
		resize: "vertical",
	};

	const buttonContainerStyle = {
		display: "flex",
		justifyContent: "flex-end",
		gap: "8px",
		marginTop: "12px",
	};

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			closeAfterTransition
			BackdropProps={{
				style: { backgroundColor: "rgba(0,0,0,0.3)" },
			}}
		>
			<Fade in={isOpen} timeout={300}>
				<div style={modalContainerStyle}>
					<h2 style={titleStyle}>Order Aerial Imagery</h2>
					<div style={descriptionStyle}>
						Review your polygons and submit to order high-resolution imagery.
					</div>
					<div style={polygonListStyle}>
						{polygons.length === 0 ? (
							<div style={{ color: "#aaa", fontSize: "14px" }}>
								No polygons drawn yet.
							</div>
						) : (
							polygons.map((p) => (
								<div key={p.id} style={polygonItemStyle}>
									<div style={{ fontWeight: "bold", color: "#fff" }}>
										{p.name}
									</div>
									<div style={{ fontSize: "13px", color: "#ccc" }}>
										Area: {p.area.toFixed(2)} m²
									</div>
									<div style={{ fontSize: "13px", color: "#ccc" }}>
										Perimeter: {p.perimeter.toFixed(2)} m
									</div>
								</div>
							))
						)}
					</div>
					<div style={{ marginBottom: "12px" }}>
						<label style={notesLabelStyle}>Notes:</label>
						<textarea
							style={textAreaStyle}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Additional instructions or notes"
						/>
					</div>
					<div style={buttonContainerStyle}>
						<Button
							onClick={onClose}
							text="Cancel"
							bg="#555"
							iconColor="#fff"
						/>
						<Button onClick={() => onSubmitOrder(notes)} text="Submit" />
					</div>
				</div>
			</Fade>
		</Modal>
	);
};

export default PolygonOrderModal;
