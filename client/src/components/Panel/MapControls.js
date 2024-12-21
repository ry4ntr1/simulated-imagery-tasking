// MapControls.js
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import VisibilityOffSharpIcon from "@mui/icons-material/VisibilityOffSharp";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import EditSharpIcon from "@mui/icons-material/EditSharp"; // for "Draw Polygon"

const MapControls = ({
	accentColor,
	textColor,
	onShareLinkClick,
	onToggleVisibility,
	tilesVisible,
	selectedDataset,
	downloadDataset,
	drawMode,
	setDrawMode,
}) => {
	// Adjust container to be bottom-center
	const buttonContainerStyle = {
		position: "absolute",
		bottom: "16px",
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		alignItems: "center",
		gap: "8px",
		zIndex: 10,
	};

	return (
		<div style={buttonContainerStyle}>
			{/* Draw Polygon Toggle */}
			<Tooltip
				title={drawMode ? "Disable draw mode" : "Enable draw mode"}
				arrow
			>
				<div>
					<Button
						onClick={() => setDrawMode(!drawMode)}
						bg={drawMode ? "#d62d20" : accentColor}
						iconColor={textColor}
						icon={<EditSharpIcon />}
						text={drawMode ? "Stop Drawing" : "Draw Polygon"}
					/>
				</div>
			</Tooltip>

			{/* Share Link */}
			<Tooltip title="Get shareable link" arrow>
				<div>
					<Button
						onClick={onShareLinkClick}
						bg={accentColor}
						iconColor={textColor}
						icon={<LinkSharpIcon />}
					/>
				</div>
			</Tooltip>

			{/* Toggle Dataset Visibility */}
			<Tooltip title="Toggle dataset visibility" arrow>
				<div>
					<Button
						onClick={onToggleVisibility}
						bg={accentColor}
						iconColor={textColor}
						icon={
							tilesVisible ? (
								<VisibilitySharpIcon />
							) : (
								<VisibilityOffSharpIcon />
							)
						}
					/>
				</div>
			</Tooltip>

			{/* Download Dataset */}
			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<div>
						<Button
							onClick={() => downloadDataset(selectedDataset)}
							bg={accentColor}
							iconColor={textColor}
							icon={<DownloadSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default MapControls;
