// src/components/Panel/PolygonCart.js
import React, { useState } from "react";
import Button from "../UI/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // <--- new export icon

import { m2ToKm2, mToKm } from "../../utils/unitConverters";
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
	const [expandedProps, setExpandedProps] = useState({});

	const cartWidth = 320;

	const cartStyle = {
		position: "absolute",
		top: "72px", // below nav
		right: "16px",
		width: cartWidth,
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
		fontWeight: "bold",
		color: "#fff",
	};

	const buttonGroupStyle = {
		display: "flex",
		alignItems: "center",
		gap: "8px",
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

	// --------------------------------------
	// Export polygons as FeatureCollection
	// --------------------------------------
	const exportGeoJSON = () => {
		const features = polygons.map((p) => p.geojson);
		const featureCollection = {
			type: "FeatureCollection",
			features,
		};

		const dataStr = JSON.stringify(featureCollection, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "polygons.geojson";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

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
			{/* Header => "Saved Areas" on left, icons on right */}
			<div style={headerStyle}>
				<h2 style={titleStyle}>Saved Areas</h2>

				{/* Right side icons */}
				<div style={buttonGroupStyle}>
					{/* Export button => icon only, no bg/border */}
					<Button
						text=""
						icon={<FileDownloadIcon style={{ fontSize: 20 }} />}
						onClick={exportGeoJSON}
						bg="transparent"
						iconColor="#fff"
						style={{
							border: "none",
							boxShadow: "none",
							padding: "6px",
						}}
						className="noHover"
					/>

					{/* Close => rotated FirstPageIcon, no border/bg */}
					<Button
						text=""
						icon={<FirstPageIcon style={{ transform: "rotate(180deg)" }} />}
						onClick={onCloseCart}
						bg="transparent"
						iconColor="#fff"
						style={{
							border: "none",
							boxShadow: "none",
							padding: "6px",
						}}
						className="noHover"
					/>
				</div>
			</div>

			<div style={contentStyle}>
				{polygons.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							padding: "12px",
							fontStyle: "italic",
							color: "#555",
						}}
					>
						You haven't drawn any areas yet.
					</div>
				) : (
					polygons.map((poly) => {
						const polygonName =
							poly.properties?.name || poly.name || "Unnamed Polygon";
						const screenshotUrl = poly.properties?.screenshotUrl;
						const areaSqKm = m2ToKm2(poly.area).toFixed(2);
						const perimeterKm = mToKm(poly.perimeter).toFixed(2);

						const isEditingName = editId === poly.id;
						const isExpanded = expandedProps[poly.id] || false;

						const otherProps = Object.fromEntries(
							Object.entries(poly.properties || {}).filter(
								([k]) => !["name", "screenshotUrl"].includes(k)
							)
						);

						return (
							<div key={poly.id} style={itemContainerStyle}>
								{/* Title row => polygon name, rename, delete */}
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

										{/* Delete icon */}
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

								{/* Optional screenshot */}
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

								{/* Area & Perimeter */}
								<div style={{ fontSize: "13px", marginBottom: "8px" }}>
									<div>
										<strong>Area</strong>: {areaSqKm} km²
									</div>
									<div>
										<strong>Perimeter</strong>: {perimeterKm} km
									</div>
								</div>

								{/* More Info => aligned to left under area/perimeter */}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-start",
										gap: "8px",
										marginBottom: "8px",
									}}
								>
									<div
										style={{
											fontSize: "13px",
											fontWeight: "bold",
											color: "#444",
										}}
									>
										More Info
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
										bg="transparent"
										iconColor="#444"
										style={{
											border: "none",
											padding: "4px",
											boxShadow: "none",
											cursor: "pointer",
										}}
										className="noHover"
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

										{/* leftover props */}
										{Object.keys(otherProps).length > 0 && (
											<div style={{ marginTop: "4px" }}>
												<strong>Other Props:</strong>
												<pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
													{JSON.stringify(otherProps, null, 2)}
												</pre>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default PolygonCart;
