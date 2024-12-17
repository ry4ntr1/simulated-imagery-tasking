import React from "react";

const Toast = ({ message }) => {
	return (
		<div
			style={{
				position: "absolute",
				bottom: "20px",
				left: "50%",
				transform: "translateX(-50%)",
				background: "#412db5",
				color: "#fff",
				padding: "8px 16px",
				borderRadius: "3px",
				fontSize: "14px",
			}}
		>
			{message}
		</div>
	);
};

export default Toast;