// PolygonCart.js
import React, { useState } from "react";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import { m2ToSqFt, mToFt } from "../../utils/unitConverters";
import { bbox } from "@turf/turf";

const PolygonCart = ({
	polygons,
	cartOpen,
	onCloseCart,
	removePolygon,
	renamePolygon,
	updatePolygon,
	mapRef,
	selectedFeatureId,
}) => {
	const [editId, setEditId] = useState(null);
	const [newName, setNewName] = useState("");
	const [editingFeatureId, setEditingFeatureId] = useState(null);

	const cartWidth = 320;
	const cartHeight = 500;

	const cartStyle = {
		position: "absolute",
		// 56px nav + 16px offset => ensures it’s entirely below the navbar
		top: "72px",
		right: "16px",
		width: cartWidth,
		height: cartHeight,
		borderRadius: "12px",
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		transition: "transform 0.3s ease",
		transform: cartOpen ? "translateX(0)" : `translateX(${cartWidth + 40}px)`,
		// Set zIndex < MUI AppBar (~1100), so it never covers the nav
		zIndex: 1000,
	};

	const headerStyle = {
		padding: "12px 16px",
		backgroundColor: "#121212",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	};

	const titleStyle = {
		margin: 0,
		fontSize: "16px",
		color: "#fff",
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

	const handleEditPolygon = (poly) => {
		if (!mapRef.current) return;
		const boundBox = bbox(poly);
		mapRef.current.fitBounds(boundBox, { padding: 50, duration: 500 });

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

	const handleDeletePolygon = (id) => {
		if (window.drawControlRef?.current) {
			window.drawControlRef.current.delete(id);
		}
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
				<Button
					text="Close"
					onClick={onCloseCart}
					bg="#333"
					iconColor="#fff"
					className="text-sm"
				/>
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

								{/* Show Delete only if this polygon is selected */}
								{poly.id === selectedFeatureId && (
									<Button
										text="Delete"
										icon={<DeleteIcon style={{ fontSize: "16px" }} />}
										onClick={() => handleDeletePolygon(poly.id)}
										bg="#e55"
										iconColor="#fff"
									/>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default PolygonCart;
