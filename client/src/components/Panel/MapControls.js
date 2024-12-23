// MapControls.js
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
// Icons
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import VisibilityOffSharpIcon from "@mui/icons-material/VisibilityOffSharp";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
	isPolygonSelected,
	onDeleteSelectedPolygon,
	cartOpen,
	onToggleCart,
}) => {
	const containerStyle = {
		position: "absolute",
		bottom: "16px",
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		alignItems: "center",
		gap: "8px",
		zIndex: 10,
		backgroundColor: "#222",
		padding: "8px 12px",
		borderRadius: "8px",
		border: "1px solid #333",
	};

	const iconColor = "#fff";

	return (
		<div style={containerStyle}>
			{/* Draw polygon toggle */}
			<Tooltip title={drawMode ? "Stop Drawing" : "Draw Polygon"} arrow>
				<div>
					<Button
						onClick={() => setDrawMode(!drawMode)}
						bg={accentColor}
						iconColor={iconColor}
						icon={drawMode ? <StopIcon /> : <ModeEditIcon />}
						text={drawMode ? "Stop" : "Draw"}
					/>
				</div>
			</Tooltip>

			{/* Delete polygon if one is selected */}
			{isPolygonSelected && (
				<Tooltip title="Delete selected polygon" arrow>
					<div>
						<Button
							onClick={onDeleteSelectedPolygon}
							bg="#d62d20"
							iconColor={iconColor}
							icon={<DeleteIcon />}
							text="Delete"
						/>
					</div>
				</Tooltip>
			)}

			{/* Share link */}
			<Tooltip title="Get shareable link" arrow>
				<div>
					<Button
						onClick={onShareLinkClick}
						bg={accentColor}
						iconColor={iconColor}
						icon={<LinkSharpIcon />}
					/>
				</div>
			</Tooltip>

			{/* Toggle tile visibility */}
			<Tooltip title="Toggle dataset visibility" arrow>
				<div>
					<Button
						onClick={onToggleVisibility}
						bg={accentColor}
						iconColor={iconColor}
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

			{/* Download dataset if selected */}
			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<div>
						<Button
							onClick={() => downloadDataset(selectedDataset)}
							bg={accentColor}
							iconColor={iconColor}
							icon={<DownloadSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{/* View/Close cart */}
			<Tooltip title={cartOpen ? "Close cart" : "View cart"} arrow>
				<div>
					<Button
						onClick={onToggleCart}
						bg="#444"
						iconColor={iconColor}
						icon={
							<ArrowForwardIosIcon
								style={{
									transform: cartOpen ? "rotate(180deg)" : "rotate(0deg)",
								}}
							/>
						}
					/>
				</div>
			</Tooltip>
		</div>
	);
};

export default MapControls;
