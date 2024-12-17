import React from "react";

const Button = ({
	onClick,
	iconClass,
	ariaLabel,
	height = 32,
	bg = "#414344",
}) => {
	const style = {
		width: height + "px",
		height: height + "px",
		border: `1px solid #412db5`,
		borderRadius: "3px",
		backgroundColor: bg,
		color: "#fff",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
	};

	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel}
			style={style}
			onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#412db5")}
			onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
		>
			<i className={iconClass} style={{ color: "#fff", fontSize: "14px" }}></i>
		</button>
	);
};

export default Button;
