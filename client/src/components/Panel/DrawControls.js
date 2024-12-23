// DrawControls.js
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";

// Icons
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ModeEditIcon from "@mui/icons-material/ModeEdit"; // For draw
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HideImageIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * DrawControls
 * - Pinned at bottom center of the screen
 * - White "floating" container, no border around container or buttons
 * - Buttons: Zoom In, Zoom Out, Draw (icon only), Toggle Polygons,
 *   plus optional tile toggles, share link, download, delete, etc.
 * - Subtle hover effect changes button background from #fff to #f4f4f4.
 */
const DrawControls = ({
	// For zoom & polygons
	drawMode,
	setDrawMode,
	polygonsVisible,
	setPolygonsVisible,
	// For tile/share
	tilesVisible,
	onToggleVisibility,
	onShareLinkClick,
	selectedDataset,
	downloadDataset,
	// For polygon deletion
	isPolygonSelected,
	onDeleteSelectedPolygon,
}) => {
	// Container pinned bottom-center
	const containerStyle = {
		position: "absolute",
		bottom: "32px", // or adjust as desired
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

	// White buttons, black icons
	const buttonBg = "#fff";
	const iconColor = "#000";

	// Subtle hover => background #f4f4f4
	const onHover = (e, hover) => {
		e.currentTarget.style.backgroundColor = hover ? "#f4f4f4" : "#fff";
		e.currentTarget.style.cursor = "pointer";
	};

	// Example zoom logic referencing a global window.mapRef
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

	const handleToggleDraw = () => {
		setDrawMode(!drawMode);
	};

	const handleTogglePolygons = () => {
		const newVis = !polygonsVisible;
		setPolygonsVisible(newVis);
		if (window.mapRef && window.mapRef.getLayer("drawnPolygonLayer")) {
			window.mapRef.setLayoutProperty(
				"drawnPolygonLayer",
				"visibility",
				newVis ? "visible" : "none"
			);
		}
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

			{/* Draw (icon only, no text) */}
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
						icon={<ModeEditIcon />} // no text
					/>
				</div>
			</Tooltip>

			{/* Toggle drawn polygons */}
			<Tooltip title="Toggle Drawn Polygons" arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={handleTogglePolygons}
						bg={buttonBg}
						iconColor={iconColor}
						icon={polygonsVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
					/>
				</div>
			</Tooltip>

			{/* Subtle divider */}
			<div
				style={{
					width: "1px",
					height: "24px",
					backgroundColor: "#ccc",
					margin: "0 8px",
				}}
			/>

			{/* Optional share link */}
			{onShareLinkClick && (
				<Tooltip title="Get shareable link" arrow>
					<div
						style={{ borderRadius: "8px" }}
						onMouseEnter={(e) => onHover(e, true)}
						onMouseLeave={(e) => onHover(e, false)}
					>
						<Button
							onClick={onShareLinkClick}
							bg={buttonBg}
							iconColor={iconColor}
							icon={<LinkSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{/* Toggle tile visibility */}
			<Tooltip title="Toggle tile visibility" arrow>
				<div
					style={{ borderRadius: "8px" }}
					onMouseEnter={(e) => onHover(e, true)}
					onMouseLeave={(e) => onHover(e, false)}
				>
					<Button
						onClick={onToggleVisibility}
						bg={buttonBg}
						iconColor={iconColor}
						icon={tilesVisible ? <HideImageIcon /> : <ImageIcon />}
					/>
				</div>
			</Tooltip>

			{/* Download dataset if selected */}
			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<div
						style={{ borderRadius: "8px" }}
						onMouseEnter={(e) => onHover(e, true)}
						onMouseLeave={(e) => onHover(e, false)}
					>
						<Button
							onClick={() => downloadDataset(selectedDataset)}
							bg={buttonBg}
							iconColor={iconColor}
							icon={<DownloadSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{/* Delete polygon if one is selected */}
			{isPolygonSelected && (
				<Tooltip title="Delete selected polygon" arrow>
					<div
						style={{ borderRadius: "8px" }}
						onMouseEnter={(e) => onHover(e, true)}
						onMouseLeave={(e) => onHover(e, false)}
					>
						<Button
							onClick={onDeleteSelectedPolygon}
							bg={buttonBg}
							iconColor={iconColor}
							icon={<DeleteIcon />}
						/>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default DrawControls;
