import React, { useState } from "react";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import { m2ToSqFt, mToFt } from "../../utils/unitConverters";
import { bbox } from "@turf/turf";

/**
 * PolygonCart
 * - White floating modal, no edges touching screen.
 * - Slide in/out animation from the right.
 * - The "item" backgrounds now use a light gray for contrast.
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
		backgroundColor: "#f7f7f7", // lighter gray for polygons
		borderRadius: "6px",
		border: "1px solid #ddd",
		padding: "8px",
		marginBottom: "8px",
		color: "#121212",
	};

	// Zoom to polygon
	const handleSelectPolygon = (poly) => {
		if (!mapRef.current) return;
		const boundBox = bbox(poly);
		mapRef.current.fitBounds(boundBox, { padding: 50, duration: 500 });

		if (window.drawControlRef?.current) {
			window.drawControlRef.current.changeMode("direct_select", {
				featureId: poly.id,
			});
		} else if (window.drawControl) {
			window.drawControl.changeMode("direct_select", { featureId: poly.id });
		}
		setEditingFeatureId(poly.id);
	};

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
		<div style={cartStyle}>
			{/* Header row */}
			<div style={headerStyle}>
				<h2 style={titleStyle}>Cart</h2>
				{/* Optionally a close button */}
				{/* <Button text="Close" bg="#ddd" onClick={onCloseCart} iconColor="#121212" /> */}
			</div>

			{/* Scrollable content */}
			<div style={contentStyle}>
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
										border: "1px solid #ccc",
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

							<div style={{ fontSize: "13px", marginBottom: "8px" }}>
								<div>Area: {areaSqft} ft²</div>
								<div>Perimeter: {perimeterFt} ft</div>
							</div>

							{/* Action buttons */}
							<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
								{isEditing ? (
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

								{editingFeatureId === poly.id ? (
									<Button
										text="Finish Edit"
										icon={<CheckIcon style={{ fontSize: "16px" }} />}
										onClick={handleFinishEdit}
										bg="#bbb"
										iconColor="#121212"
									/>
								) : (
									<Button
										text="Select"
										onClick={() => handleSelectPolygon(poly.geojson || poly)}
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
