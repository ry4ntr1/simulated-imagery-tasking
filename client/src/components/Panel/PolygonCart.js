// PolygonCart.js
import React, { useState } from "react";
import Button from "../UI/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Helper conversion
function m2ToSqFt(m2) {
	return m2 * 10.7639; // approximate
}
function mToFt(m) {
	return m * 3.28084; // approximate
}

const PolygonCart = ({ polygons, removePolygon, renamePolygon }) => {
	// For inline editing, track polygon ID being edited and the new name
	const [editId, setEditId] = useState(null);
	const [newName, setNewName] = useState("");

	const cartContainerStyle = {
		position: "absolute",
		top: 0,
		right: 0,
		width: "320px",
		height: "100%",
		backgroundColor: "#2a2a2a",
		color: "#fff",
		overflowY: "auto",
		borderLeft: "1px solid #333",
		padding: "16px",
		boxSizing: "border-box",
	};

	const cartItemStyle = {
		display: "flex",
		flexDirection: "row",
		marginBottom: "16px",
		padding: "8px",
		backgroundColor: "#1e1e1e",
		borderRadius: "8px",
		border: "1px solid #333",
	};

	// Left and right columns
	const leftColStyle = {
		display: "flex",
		flexDirection: "column",
		width: "50%",
		alignItems: "flex-start",
		justifyContent: "space-between",
		paddingRight: "8px",
	};
	const rightColStyle = {
		display: "flex",
		flexDirection: "column",
		width: "50%",
		alignItems: "flex-end",
		justifyContent: "space-between",
		paddingLeft: "8px",
	};

	const polygonImageStyle = {
		width: "100%",
		height: "80px",
		backgroundColor: "#444",
		borderRadius: "4px",
		marginTop: "8px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#aaa",
		fontSize: "12px",
	};

	const nameStyle = {
		fontSize: "14px",
		fontWeight: "bold",
		margin: 0,
	};

	return (
		<div style={cartContainerStyle}>
			<h2 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Polygon Cart</h2>

			{polygons.length === 0 ? (
				<div style={{ color: "#aaa", fontSize: "14px" }}>
					No polygons in the cart.
				</div>
			) : (
				polygons.map((polygon) => {
					const areaSqft = m2ToSqFt(polygon.area).toFixed(2);
					const perimeterFt = mToFt(polygon.perimeter).toFixed(2);

					const isEditing = editId === polygon.id;

					return (
						<div key={polygon.id} style={cartItemStyle}>
							{/* Left Column */}
							<div style={leftColStyle}>
								{/* Name (LHS top) */}
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
									<h3 style={nameStyle}>{polygon.name}</h3>
								)}

								{/* Polygon Image (LHS bottom) */}
								<div style={polygonImageStyle}>
									{/* Placeholder: You could render an actual image or Mapbox static image */}
									<span>Polygon Image</span>
								</div>

								{/* Edit (below polygon image) */}
								{isEditing ? (
									<Button
										text="Save"
										onClick={() => {
											renamePolygon(polygon.id, newName);
											setEditId(null);
											setNewName("");
										}}
										style={{ marginTop: "8px" }}
									/>
								) : (
									<Button
										text="Edit"
										icon={<EditIcon style={{ fontSize: "16px" }} />}
										onClick={() => {
											setEditId(polygon.id);
											setNewName(polygon.name);
										}}
										style={{ marginTop: "8px" }}
									/>
								)}
							</div>

							{/* Right Column */}
							<div style={rightColStyle}>
								{/* sqft (rhs) */}
								<div style={{ marginBottom: "8px" }}>
									<strong>Area:</strong> {areaSqft} ft²
								</div>
								{/* perim (rhs) */}
								<div style={{ marginBottom: "8px" }}>
									<strong>Perimeter:</strong> {perimeterFt} ft
								</div>

								{/* delete (RHS bottom) */}
								<Button
									text="Delete"
									icon={<DeleteIcon style={{ fontSize: "16px" }} />}
									onClick={() => removePolygon(polygon.id)}
									style={{ alignSelf: "flex-end" }}
									bg="#d62d20"
								/>
							</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default PolygonCart;
