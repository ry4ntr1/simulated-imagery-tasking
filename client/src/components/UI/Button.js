// Button.js
import React from "react";

const Button = ({
	onClick,
	bg = "#222222",
	iconColor = "#fff",
	icon,
	text,
}) => {
	const buttonStyle = {
		backgroundColor: bg,
		color: iconColor,
		border: "1px solid #333333",
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
		e.currentTarget.style.borderColor = hover ? "#fff" : "#333333";
		e.currentTarget.style.backgroundColor = hover ? "#333333" : "#222222";
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
