// Button.js
import React from "react";

const Button = ({
	onClick,
	bg = "#fff", // default to white
	iconColor = "#121212", // text/icons are #121212
	icon,
	text,
}) => {
	const buttonStyle = {
		backgroundColor: bg,
		color: iconColor,
		border: "1px solid #ccc",
		borderRadius: "8px",
		padding: "6px 10px",
		display: "inline-flex",
		alignItems: "center",
		gap: "4px",
		cursor: "pointer",
		fontSize: "14px",
		transition: "background-color 0.2s, border-color 0.2s",
		boxSizing: "border-box",
	};

	const hoverStyle = (e, hover) => {
		e.currentTarget.style.borderColor = hover ? "#999" : "#ccc";
		e.currentTarget.style.backgroundColor = hover ? "#f2f2f2" : bg;
	};

	return (
		<button
			onClick={onClick}
			style={buttonStyle}
			onMouseEnter={(e) => hoverStyle(e, true)}
			onMouseLeave={(e) => hoverStyle(e, false)}
		>
			{icon} {text}
		</button>
	);
};

export default Button;
