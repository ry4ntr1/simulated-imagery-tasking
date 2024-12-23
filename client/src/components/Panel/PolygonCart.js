// PolygonCart.js
import React, { useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import { m2ToSqFt, mToFt } from "../../utils/unitConverters";
import { bbox, center as turfCenter } from "@turf/turf";

/**
 * PolygonCart
 * - Shows a drawer pinned at the right side, toggled open/closed by cartOpen
 * - Each polygon can be selected for editing (direct_select),
 *   or "Finish Edit" to go back to normal mode.
 */
const PolygonCart = ({
	polygons,
	cartOpen,
	onCloseCart,
	removePolygon,
	renamePolygon,
	updatePolygon,
	mapRef,
}) => {
	// For inline rename
	const [editId, setEditId] = useState(null);
	const [newName, setNewName] = useState("");

	// For "Finish Edit"
	const [editingFeatureId, setEditingFeatureId] = useState(null);

	const drawerStyle = {
		position: "absolute",
		top: "60px", // pinned so it won't shift up/down
		right: cartOpen ? "16px" : "-280px",
		width: "260px",
		height: "calc(100% - 80px)",
		transition: "right 0.3s",
		backgroundColor: "#222",
		border: "1px solid #333",
		borderRadius: "8px",
		overflowY: "auto",
		zIndex: 2000,
		padding: "8px",
	};

	const closeButtonStyle = {
		position: "absolute",
		top: "8px",
		left: "8px",
		background: "none",
		border: "none",
		color: "#fff",
		cursor: "pointer",
	};

	const cartTitleStyle = {
		marginTop: "40px", // so we don't overlap the close icon
		marginBottom: "8px",
		fontSize: "16px",
		color: "#fff",
	};

	const itemStyle = {
		backgroundColor: "#1e1e1e",
		borderRadius: "6px",
		border: "1px solid #333",
		padding: "8px",
		marginBottom: "8px",
	};

	// Zoom to polygon and set direct_select
	const handleSelectPolygon = (poly) => {
		if (!mapRef.current) return;

		// Fit bounds to polygon
		const boundBox = bbox(poly);
		mapRef.current.fitBounds(boundBox, { padding: 50, duration: 500 });

		// Switch to direct_select mode
		if (window.drawControlRef?.current || window.drawControl) {
			const featureId = poly.id;
			if (window.drawControlRef?.current) {
				window.drawControlRef.current.changeMode("direct_select", {
					featureId,
				});
			}
			if (window.drawControl) {
				window.drawControl.changeMode("direct_select", { featureId });
			}
		}
		setEditingFeatureId(poly.id);
	};

	// Finish editing by switching to simple_select
	const handleFinishEdit = () => {
		if (window.drawControlRef?.current) {
			window.drawControlRef.current.changeMode("simple_select");
		}
		if (window.drawControl) {
			window.drawControl.changeMode("simple_select");
		}
		setEditingFeatureId(null);
	};

	const handleDeletePolygon = (id) => {
		removePolygon(id);
	};

	const handleRenamePolygon = (id) => {
		renamePolygon(id, newName);
		setEditId(null);
		setNewName("");
	};

	return (
		<div style={drawerStyle}>
			{cartOpen && (
				<button style={closeButtonStyle} onClick={onCloseCart}>
					<ArrowForwardIosIcon style={{ transform: "rotate(180deg)" }} />
				</button>
			)}

			<h2 style={cartTitleStyle}>My Polygons</h2>

			{polygons.map((poly) => {
				const isEditing = editId === poly.id;
				const polygonName =
					poly.properties?.name || poly.name || "Unnamed Polygon";
				const screenshotUrl = poly.properties?.screenshotUrl;

				const areaSqft = m2ToSqFt(poly.area).toFixed(2);
				const perimeterFt = mToFt(poly.perimeter).toFixed(2);

				return (
					<div key={poly.id} style={itemStyle}>
						{isEditing ? (
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
								}}
							/>
						) : (
							<h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
								{polygonName}
							</h3>
						)}

						<div
							style={{
								width: "100%",
								height: "80px",
								borderRadius: "4px",
								marginBottom: "8px",
								border: "1px solid #444",
								backgroundColor: "#444",
								overflow: "hidden",
							}}
						>
							{screenshotUrl ? (
								<img
									src={screenshotUrl}
									alt="Polygon"
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							) : (
								<div
									style={{
										fontSize: "12px",
										color: "#ccc",
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

						<div style={{ fontSize: "13px", marginBottom: "8px" }}>
							<div>Area: {areaSqft} ft²</div>
							<div>Perimeter: {perimeterFt} ft</div>
						</div>

						{/* Action buttons */}
						<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
							{/* If editing, we show "Save Name" or "Rename" */}
							{isEditing ? (
								<Button
									text="Save"
									icon={<CheckIcon style={{ fontSize: "16px" }} />}
									onClick={() => handleRenamePolygon(poly.id)}
									bg="#666"
								/>
							) : (
								<Button
									text="Rename"
									icon={<ModeEditIcon style={{ fontSize: "16px" }} />}
									onClick={() => {
										setEditId(poly.id);
										setNewName(polygonName);
									}}
									bg="#555"
								/>
							)}

							{/* Select / Finish Edit buttons */}
							{editingFeatureId === poly.id ? (
								<Button
									text="Finish Edit"
									icon={<CheckIcon style={{ fontSize: "16px" }} />}
									onClick={handleFinishEdit}
									bg="#444"
								/>
							) : (
								<Button
									text="Select"
									onClick={() => handleSelectPolygon(poly.geojson || poly)}
									bg="#444"
								/>
							)}

							<Button
								text="Delete"
								icon={<DeleteIcon style={{ fontSize: "16px" }} />}
								onClick={() => handleDeletePolygon(poly.id)}
								bg="#d62d20"
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default PolygonCart;
