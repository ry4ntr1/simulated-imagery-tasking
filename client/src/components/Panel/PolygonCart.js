// PolygonCart.js
import React, { useState } from "react";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import { m2ToSqFt, mToFt } from "../../utils/unitConverters";
import { bbox } from "@turf/turf";

/**
 * PolygonCart
 * - Initially closed, opens automatically when a new polygon is added
 * - Contains a list of drawn polygons
 * - Each polygon has data to replicate shape (geojson)
 * - "Delete" button removes from local state (usePolygonManager) AND from map
 */
const PolygonCart = ({
	polygons,
	cartOpen,
	onCloseCart,
	removePolygon, // from usePolygonManager
	renamePolygon,
	updatePolygon,
	mapRef,
}) => {
	const [editId, setEditId] = useState(null);
	const [newName, setNewName] = useState("");
	const [editingFeatureId, setEditingFeatureId] = useState(null);

	const cartWidth = 320;
	const cartHeight = 600; // or "auto"
	const marginX = 14;
	const marginY = 70;

	const cartStyle = {
		position: "absolute",
		top: marginY,
		bottom: marginY,
		width: cartWidth,
		maxHeight: `calc(100% - ${2 * marginY}px)`,
		height: cartHeight,
		right: marginX,
		borderRadius: "12px",
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		zIndex: 2000,
		transform: cartOpen ? "translateX(0)" : "translateX(110%)",
		transition: "transform 0.3s ease",
	};

	const headerStyle = {
		padding: "12px 16px",
		borderBottom: "1px solid #ccc",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	};

	const titleStyle = {
		margin: 0,
		fontSize: "16px",
		color: "#121212",
	};

	const contentStyle = {
		flex: 1,
		overflowY: "auto",
		padding: "12px",
		boxSizing: "border-box",
	};

	const itemStyle = {
		backgroundColor: "#f7f7f7",
		borderRadius: "6px",
		border: "1px solid #ddd",
		padding: "8px",
		marginBottom: "8px",
		color: "#121212",
	};

	// Zoom to bounding box
	const handleEditPolygon = (poly) => {
		if (!mapRef.current) return;
		const boundBox = bbox(poly);
		mapRef.current.fitBounds(boundBox, { padding: 50, duration: 500 });
		// Switch to direct_select on that polygon ID if you want to edit
		if (window.drawControlRef?.current) {
			window.drawControlRef.current.changeMode("direct_select", {
				featureId: poly.id,
			});
		}
		setEditingFeatureId(poly.id);
	};

	const handleFinishEdit = () => {
		if (window.drawControlRef?.current) {
			window.drawControlRef.current.changeMode("simple_select");
		}
		setEditingFeatureId(null);
	};

	// Remove from cart & map
	const handleDeletePolygon = (id) => {
		// 1) Remove from map’s draw layer
		if (window.drawControlRef?.current) {
			window.drawControlRef.current.delete(id);
		}
		// 2) Remove from local state
		removePolygon(id);
	};

	const handleRenamePolygon = (id) => {
		renamePolygon(id, newName);
		setEditId(null);
		setNewName("");
	};

	return (
		<div style={cartStyle}>
			{/* Header row */}
			<div style={headerStyle}>
				<h2 style={titleStyle}>Cart</h2>
			</div>

			{/* Scrollable content */}
			<div style={contentStyle}>
				{polygons.map((poly) => {
					const isEditingName = editId === poly.id;
					const polygonName =
						poly.properties?.name || poly.name || "Unnamed Polygon";
					const screenshotUrl = poly.properties?.screenshotUrl;
					const areaSqft = m2ToSqFt(poly.area).toFixed(2);
					const perimeterFt = mToFt(poly.perimeter).toFixed(2);
					const isBeingEdited = editingFeatureId === poly.id;

					return (
						<div key={poly.id} style={itemStyle}>
							{isEditingName ? (
								<input
									type="text"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									style={{
										width: "100%",
										marginBottom: "4px",
										borderRadius: "4px",
										padding: "4px",
										boxSizing: "border-box",
										border: "1px solid #ccc",
									}}
								/>
							) : (
								<h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
									{polygonName}
								</h3>
							)}

							{/* Thumbnail */}
							<div
								style={{
									width: "100%",
									height: "80px",
									borderRadius: "4px",
									marginBottom: "8px",
									border: "1px solid #ccc",
									backgroundColor: "#e9e9e9",
									overflow: "hidden",
								}}
							>
								{screenshotUrl ? (
									<img
										src={screenshotUrl}
										alt="Polygon"
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								) : (
									<div
										style={{
											fontSize: "12px",
											color: "#666",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											height: "100%",
										}}
									>
										No image
									</div>
								)}
							</div>

							{/* Info */}
							<div style={{ fontSize: "13px", marginBottom: "8px" }}>
								<div>Area: {areaSqft} ft²</div>
								<div>Perimeter: {perimeterFt} ft</div>
								{/* For replicating shape: we also have poly.geojson with full coords */}
							</div>

							{/* Actions */}
							<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
								{isEditingName ? (
									<Button
										text="Save"
										icon={<CheckIcon style={{ fontSize: "16px" }} />}
										onClick={() => handleRenamePolygon(poly.id)}
										bg="#ddd"
										iconColor="#121212"
									/>
								) : (
									<Button
										text="Rename"
										icon={<ModeEditIcon style={{ fontSize: "16px" }} />}
										onClick={() => {
											setEditId(poly.id);
											setNewName(polygonName);
										}}
										bg="#ccc"
										iconColor="#121212"
									/>
								)}

								{isBeingEdited ? (
									<Button
										text="Finish Edit"
										icon={<CheckIcon style={{ fontSize: "16px" }} />}
										onClick={handleFinishEdit}
										bg="#bbb"
										iconColor="#121212"
									/>
								) : (
									<Button
										text="Edit"
										onClick={() => handleEditPolygon(poly.geojson || poly)}
										bg="#bbb"
										iconColor="#121212"
									/>
								)}

								<Button
									text="Delete"
									icon={<DeleteIcon style={{ fontSize: "16px" }} />}
									onClick={() => handleDeletePolygon(poly.id)}
									bg="#e55"
									iconColor="#fff"
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default PolygonCart;
