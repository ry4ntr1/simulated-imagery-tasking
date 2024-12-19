import React from "react";

const Button = ({
	onClick,
	icon,
	ariaLabel,
	height = 32,
	bg = "#412dba",
	iconColor = "#fff",
	style = {},
	disabled = false,
}) => {
	const baseStyle = {
		width: height + "px",
		height: height + "px",
		border: "none",
		borderRadius: "4px",
		backgroundColor: bg,
		color: iconColor,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: disabled ? "default" : "pointer",
		opacity: disabled ? 0.5 : 1,
		...style,
	};

	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel}
			style={baseStyle}
			disabled={disabled}
		>
			{icon}
		</button>
	);
};

export default Button;
