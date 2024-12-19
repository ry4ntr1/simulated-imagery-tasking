import React from "react";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

const BackForwardControls = ({
	canGoBack,
	canGoForward,
	onGoBack,
	onGoForward,
	accentColor,
	textColor,
}) => {
	const navButtonsContainerStyle = {
		marginTop: "16px",
		display: "flex",
		justifyContent: "space-between",
	};

	const buttonBaseStyle = {
		backgroundColor: accentColor,
		border: "none",
		borderRadius: "4px",
		width: "32px",
		height: "32px",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	return (
		<div style={navButtonsContainerStyle}>
			<div>
				{canGoBack && (
					<Tooltip title="Go back" arrow>
						<button onClick={onGoBack} style={buttonBaseStyle}>
							<ArrowBackIosNewSharpIcon
								style={{ color: textColor, fontSize: "16px" }}
							/>
						</button>
					</Tooltip>
				)}
			</div>
			<div>
				{canGoForward && (
					<Tooltip title="Go forward" arrow>
						<button onClick={onGoForward} style={buttonBaseStyle}>
							<ArrowForwardIosSharpIcon
								style={{ color: textColor, fontSize: "16px" }}
							/>
						</button>
					</Tooltip>
				)}
			</div>
		</div>
	);
};

export default BackForwardControls;
