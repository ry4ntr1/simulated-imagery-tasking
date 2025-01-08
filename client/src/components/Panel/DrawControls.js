// DrawControls.js
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";

const DrawControls = ({
	drawMode,
	setDrawMode,
	tilesVisible,
	onToggleVisibility,
	onShareLinkClick,
	selectedDataset,
	downloadDataset,
}) => {
	const containerStyle = {
		position: "absolute",
		bottom: "32px",
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		alignItems: "center",
		gap: "8px",
		backgroundColor: "#fff",
		borderRadius: "8px",
		padding: "8px 12px",
		boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
		pointerEvents: "auto",
		zIndex: 2000,
	};

	const buttonBg = "#fff";
	const iconColor = "#000";

	const onHover = (e, hover) => {
		e.currentTarget.style.backgroundColor = hover ? "#f4f4f4" : "#fff";
		e.currentTarget.style.cursor = "pointer";
	};

	const handleZoomIn = () => {
		if (window.mapRef) {
			const current = window.mapRef.getZoom();
			window.mapRef.easeTo({ zoom: current + 1 });
		}
	};

	const handleZoomOut = () => {
		if (window.mapRef) {
			const current = window.mapRef.getZoom();
			window.mapRef.easeTo({ zoom: current - 1 });
		}
	};

	const handleToggleTiles = () => {
		onToggleVisibility();
	};

	const handleShareLink = () => {
		if (onShareLinkClick) onShareLinkClick();
	};

	const handleDownload = () => {
		if (selectedDataset && downloadDataset) {
			downloadDataset(selectedDataset);
		}
	};

	const handleToggleDraw = () => {
		setDrawMode(!drawMode);
	};

	return (
		<div style={containerStyle}>
			{/* Zoom In */}
			<Tooltip title="Zoom In" arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={handleZoomIn}
						bg={buttonBg}
						iconColor={iconColor}
						icon={<ZoomInIcon />}
					/>
				</div>
			</Tooltip>

			{/* Zoom Out */}
			<Tooltip title="Zoom Out" arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={handleZoomOut}
						bg={buttonBg}
						iconColor={iconColor}
						icon={<ZoomOutIcon />}
					/>
				</div>
			</Tooltip>

			{/* Toggle tile visibility */}
			<Tooltip title="Toggle Tile Layer" arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={handleToggleTiles}
						bg={buttonBg}
						iconColor={iconColor}
						icon={tilesVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
					/>
				</div>
			</Tooltip>

			{/* Share link */}
			{onShareLinkClick && (
				<Tooltip title="Get shareable link" arrow>
					<div
						style={{ borderRadius: "8px" }}
						onMouseEnter={(e) => onHover(e, true)}
						onMouseLeave={(e) => onHover(e, false)}
					>
						<Button
							onClick={handleShareLink}
							bg={buttonBg}
							iconColor={iconColor}
							icon={<LinkSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{/* Download dataset if selected */}
			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<div
						style={{ borderRadius: "8px" }}
						onMouseEnter={(e) => onHover(e, true)}
						onMouseLeave={(e) => onHover(e, false)}
					>
						<Button
							onClick={handleDownload}
							bg={buttonBg}
							iconColor={iconColor}
							icon={<DownloadSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{/* Divider */}
			<div
				style={{
					width: "1px",
					height: "24px",
					backgroundColor: "#ccc",
					margin: "0 8px",
				}}
			/>

			{/* Draw Polygon */}
			<Tooltip title={drawMode ? "Stop Drawing" : "Draw Polygon"} arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={handleToggleDraw}
						bg={buttonBg}
						iconColor={iconColor}
						icon={<ModeEditIcon />}
					/>
				</div>
			</Tooltip>
		</div>
	);
};

export default DrawControls;
