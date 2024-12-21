// ShareLinkModal.js
import React from "react";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import Fade from "@mui/material/Fade"; // Import Fade from MUI

const ShareLinkModal = ({ shareableURL, onClose, onCopy }) => {
	const backgroundColor = "#222222";
	const textColor = "#fff";
	const borderColor = "#333333";

	const modalStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		backgroundColor: backgroundColor,
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
		color: textColor,
		padding: "16px",
		boxSizing: "border-box",
		border: `1px solid ${borderColor}`,
		width: "600px",
	};

	const inputStyle = {
		width: "100%",
		padding: "8px",
		backgroundColor: "transparent",
		border: `1px solid ${borderColor}`,
		borderRadius: "4px",
		color: textColor,
		marginBottom: "12px",
		outline: "none",
		fontSize: "14px",
	};

	const headerStyle = {
		margin: "0 0 12px 0",
		fontSize: "16px",
		fontWeight: "bold",
		color: textColor,
	};

	const buttonContainerStyle = {
		display: "flex",
		justifyContent: "flex-end",
		gap: "8px",
	};

	return (
		<Modal
			open={true}
			onClose={onClose}
			BackdropProps={{
				style: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
			}}
			closeAfterTransition
		>
			<Fade in={true} timeout={300}>
				<div style={modalStyle}>
					<h2 style={headerStyle}>Share this link</h2>
					<input style={inputStyle} type="text" value={shareableURL} readOnly />
					<div style={buttonContainerStyle}>
						<Tooltip title="Copy to clipboard" arrow>
							<Button onClick={onCopy} text="Copy" />
						</Tooltip>
						<Tooltip title="Close" arrow>
							<Button onClick={onClose} text="Close" />
						</Tooltip>
					</div>
				</div>
			</Fade>
		</Modal>
	);
};

export default ShareLinkModal;
