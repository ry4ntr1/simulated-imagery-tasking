// Toast.js
import React from "react";

const Toast = ({ message }) => {
	const toastStyle = {
		position: "fixed",
		bottom: "16px",
		left: "50%",
		transform: "translateX(-50%)",
		backgroundColor: "#222222",
		border: "1px solid #333333",
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
		color: "#fff",
		padding: "8px 16px",
		fontSize: "14px",
		zIndex: 3000,
	};

	return <div style={toastStyle}>{message}</div>;
};

export default Toast;
