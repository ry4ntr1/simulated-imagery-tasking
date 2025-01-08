// src/components/Panel/PolygonCart.js
import React, { useState } from "react";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { m2ToSqFt, mToFt } from "../../utils/unitConverters";
import { bbox } from "@turf/turf";

const PolygonCart = ({
	polygons,
	cartOpen,
	onCloseCart,
	removePolygon, // from usePolygonManager
	renamePolygon,
	updatePolygon,
	mapRef,
	selectedFeatureId,
}) => {
	const [editId, setEditId] = useState(null);
	const [newName, setNewName] = useState("");
	const [expandedProps, setExpandedProps] = useState({});

	const cartWidth = 320;

	const cartStyle = {
		position: "absolute",
		top: "72px", // below nav
		right: "16px",
		width: cartWidth,
		// limit the max height so it doesn’t overlap the DrawControls at bottom
		maxHeight: "calc(100vh - 120px)",
		borderRadius: "12px",
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		transition: "transform 0.3s ease",
		transform: cartOpen ? "translateX(0)" : `translateX(${cartWidth + 40}px)`,
		zIndex: 1300,
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

	const itemContainerStyle = {
		backgroundColor: "#f7f7f7",
		borderRadius: "6px",
		border: "1px solid #ddd",
		padding: "8px",
		marginBottom: "8px",
		color: "#121212",
	};

	// Zoom & direct_select
	const handleCartItemClick = (poly) => {
		if (!mapRef.current) return;
		const boundBox = bbox(poly);
		mapRef.current.fitBounds(boundBox, { padding: 50, duration: 500 });

		if (window.drawControlRef?.current) {
			window.drawControlRef.current.changeMode("direct_select", {
				featureId: poly.id,
			});
		}
	};

	// NOTE: here's the crucial fix: using setTimeout
	const handleDeletePolygon = (id) => {
		setTimeout(() => {
			if (window.drawControlRef?.current) {
				window.drawControlRef.current.delete(id);
			}
			removePolygon(id);
		}, 0);
	};

	const handleRenamePolygon = (id) => {
		renamePolygon(id, newName);
		setEditId(null);
		setNewName("");
	};

	const toggleProps = (polyId) => {
		setExpandedProps((prev) => ({
			...prev,
			[polyId]: !prev[polyId],
		}));
	};

	return (
		<div style={cartStyle}>
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

			<div style={contentStyle}>
				{polygons.map((poly) => {
					const polygonName =
						poly.properties?.name || poly.name || "Unnamed Polygon";
					const screenshotUrl = poly.properties?.screenshotUrl;
					const areaSqft = m2ToSqFt(poly.area).toFixed(2);
					const perimeterFt = mToFt(poly.perimeter).toFixed(2);

					const isEditingName = editId === poly.id;
					const isExpanded = expandedProps[poly.id] || false;

					return (
						<div key={poly.id} style={itemContainerStyle}>
							{/* Title row => bigger name plus rename & delete icons */}
							<div
								style={{
									fontSize: "16px",
									fontWeight: "bold",
									marginBottom: "6px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									cursor: "pointer",
								}}
								onClick={() => handleCartItemClick(poly.geojson || poly)}
							>
								{isEditingName ? (
									<input
										type="text"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										style={{
											width: "calc(100% - 80px)",
											borderRadius: "4px",
											padding: "4px",
											boxSizing: "border-box",
											border: "1px solid #ccc",
											marginRight: "8px",
										}}
									/>
								) : (
									<div style={{ fontSize: "16px", marginRight: "8px" }}>
										{polygonName}
									</div>
								)}

								<div style={{ display: "flex", gap: "6px" }}>
									{/* rename icon only */}
									{isEditingName ? (
										<Button
											text=""
											icon={<CheckIcon style={{ fontSize: "16px" }} />}
											onClick={(e) => {
												e.stopPropagation();
												handleRenamePolygon(poly.id);
											}}
											bg="#ddd"
											iconColor="#121212"
										/>
									) : (
										<Button
											text=""
											icon={<ModeEditIcon style={{ fontSize: "16px" }} />}
											onClick={(e) => {
												e.stopPropagation();
												setEditId(poly.id);
												setNewName(polygonName);
											}}
											bg="#ccc"
											iconColor="#121212"
										/>
									)}

									{/* delete icon => calls setTimeout hack */}
									<Button
										text=""
										icon={<DeleteIcon style={{ fontSize: "16px" }} />}
										onClick={(e) => {
											e.stopPropagation();
											handleDeletePolygon(poly.id);
										}}
										bg="#f88"
										iconColor="#fff"
									/>
								</div>
							</div>

							{/* Under name => image */}
							{screenshotUrl && (
								<div
									style={{
										width: "100%",
										height: "160px",
										borderRadius: "4px",
										marginBottom: "8px",
										border: "1px solid #ccc",
										backgroundColor: "#e9e9e9",
										overflow: "hidden",
										cursor: "pointer",
									}}
									onClick={() => handleCartItemClick(poly.geojson || poly)}
								>
									<img
										src={screenshotUrl}
										alt="Polygon Screenshot"
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</div>
							)}

							{/* Basic stats => area, perimeter */}
							<div style={{ fontSize: "13px", marginBottom: "8px" }}>
								<div>Area: {areaSqft} ft²</div>
								<div>Perimeter: {perimeterFt} ft</div>
							</div>

							{/* properties => expand/collapse */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-end",
								}}
							>
								<div
									style={{
										marginRight: "8px",
										fontSize: "13px",
										color: "#444",
									}}
								>
									Properties
								</div>
								<Button
									text=""
									icon={
										isExpanded ? (
											<ExpandLessIcon style={{ fontSize: "18px" }} />
										) : (
											<ExpandMoreIcon style={{ fontSize: "18px" }} />
										)
									}
									onClick={(e) => {
										e.stopPropagation();
										toggleProps(poly.id);
									}}
									bg="#ddd"
									iconColor="#121212"
								/>
							</div>

							{isExpanded && (
								<div
									style={{
										marginTop: "8px",
										backgroundColor: "#fafafa",
										border: "1px solid #ccc",
										borderRadius: "4px",
										padding: "6px",
										fontSize: "12px",
									}}
								>
									{/* ID */}
									<div>
										<strong>ID:</strong> {poly.id}
									</div>

									{/* Coordinates */}
									<div style={{ marginTop: "4px" }}>
										<strong>Coordinates:</strong>
										<pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
											{JSON.stringify(
												poly.geojson.geometry.coordinates,
												null,
												2
											)}
										</pre>
									</div>

									{/* Additional props => skipping screenshotUrl, name */}
									{Object.keys(poly.properties).length > 0 && (
										<div style={{ marginTop: "4px" }}>
											<strong>Other Info:</strong>
											<pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
												{JSON.stringify(
													Object.fromEntries(
														Object.entries(poly.properties).filter(
															([k]) => k !== "screenshotUrl" && k !== "name"
														)
													),
													null,
													2
												)}
											</pre>
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default PolygonCart;
