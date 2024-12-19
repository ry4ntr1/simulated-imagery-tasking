import React, { useEffect, useState } from "react";
import ContentCopySharpIcon from "@mui/icons-material/ContentCopySharp";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import Tooltip from "@mui/material/Tooltip";

const ShareLinkModal = ({ shareableURL, onClose, onCopy }) => {
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		setVisible(true);
	}, []);

	const overlayStyle = {
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
		opacity: visible ? 1 : 0,
		transition: "opacity 0.3s ease",
		cursor: "pointer",
	};

	const modalStyle = {
		background: "#2a2a2a",
		padding: "20px",
		borderRadius: "3px",
		color: "#fff",
		display: "flex",
		flexDirection: "column",
		gap: "10px",
		cursor: "auto",
		maxWidth: "600px",
		width: "90%",
		position: "relative",
	};

	const closeButtonStyle = {
		position: "absolute",
		top: "8px",
		left: "8px",
		background: "none",
		border: "none",
		color: "#fff",
		cursor: "pointer",
		padding: 0,
	};

	const textareaStyle = {
		width: "100%",
		borderRadius: "3px",
		background: "#181818",
		color: "#fff",
		minHeight: "40px",
		padding: "8px",
		fontSize: "14px",
		boxSizing: "border-box",
		resize: "vertical",
		maxHeight: "200px",
	};

	const buttonStyle = {
		borderRadius: "3px",
		background: "#412dba",
		color: "#fff",
		padding: "0 8px",
		height: "32px",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		gap: "5px",
		justifyContent: "center",
	};

	const handleOverlayClick = () => {
		onClose();
	};

	const handleModalClick = (e) => {
		e.stopPropagation();
	};

	return (
		<div style={overlayStyle} onClick={handleOverlayClick}>
			<div style={modalStyle} onClick={handleModalClick}>
				<button style={closeButtonStyle} onClick={onClose}>
					<CloseSharpIcon style={{ fontSize: "16px" }} />
				</button>
				<h2 style={{ fontSize: "16px", marginTop: "30px", marginBottom: "0" }}>
					Shareable Link
				</h2>
				<textarea
					readOnly
					style={textareaStyle}
					value={shareableURL}
				></textarea>
				<Tooltip title="Copy link" arrow>
					<button onClick={onCopy} style={buttonStyle}>
						<ContentCopySharpIcon style={{ fontSize: "16px" }} />
						Copy
					</button>
				</Tooltip>
			</div>
		</div>
	);
};

export default ShareLinkModal;
