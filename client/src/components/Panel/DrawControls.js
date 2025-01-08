// src/components/Panel/DrawControls.js
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

	const handleToggleDraw = () => {
		setDrawMode(!drawMode);
	};

	return (
		<div style={containerStyle}>
			{/* Zoom In */}
			<Tooltip title="Zoom In" arrow>
				<Button
					onClick={() => {
						if (window.mapRef) {
							const curr = window.mapRef.getZoom();
							window.mapRef.easeTo({ zoom: curr + 1 });
						}
					}}
					bg={buttonBg}
					iconColor={iconColor}
					icon={<ZoomInIcon />}
				/>
			</Tooltip>

			{/* Zoom Out */}
			<Tooltip title="Zoom Out" arrow>
				<Button
					onClick={() => {
						if (window.mapRef) {
							const curr = window.mapRef.getZoom();
							window.mapRef.easeTo({ zoom: curr - 1 });
						}
					}}
					bg={buttonBg}
					iconColor={iconColor}
					icon={<ZoomOutIcon />}
				/>
			</Tooltip>

			{/* Toggle Tile Visibility */}
			<Tooltip title="Toggle Tile Layer" arrow>
				<Button
					onClick={onToggleVisibility}
					bg={buttonBg}
					iconColor={iconColor}
					icon={tilesVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
				/>
			</Tooltip>

			{/* Get shareable link */}
			{onShareLinkClick && (
				<Tooltip title="Get shareable link" arrow>
					<Button
						onClick={onShareLinkClick}
						bg={buttonBg}
						iconColor={iconColor}
						icon={<LinkSharpIcon />}
					/>
				</Tooltip>
			)}

			{/* Download dataset */}
			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<Button
						onClick={() => downloadDataset(selectedDataset)}
						bg={buttonBg}
						iconColor={iconColor}
						icon={<DownloadSharpIcon />}
					/>
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

			{/* Draw Mode Toggle */}
			<Tooltip title={drawMode ? "Stop Drawing" : "Draw Polygon"} arrow>
				<Button
					onClick={handleToggleDraw}
					bg={buttonBg}
					iconColor={iconColor}
					icon={<ModeEditIcon />}
				/>
			</Tooltip>
		</div>
	);
};

export default DrawControls;
