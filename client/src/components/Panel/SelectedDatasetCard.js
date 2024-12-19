import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";

const SelectedDatasetCard = ({
	datasetName,
	metadata,
	downloadDataset,
	cardColor,
	accentColor,
	borderColor,
}) => {
	const datasetRowStyle = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		border: `1px solid ${borderColor}`,
		borderRadius: "8px",
		padding: "12px",
		marginBottom: "12px",
		boxSizing: "border-box",
		backgroundColor: cardColor,
		boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
	};

	const datasetInfoContainer = {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		flexGrow: 1,
		marginRight: "8px",
	};

	const datasetNameStyle = {
		color: accentColor,
		fontSize: "15px",
		margin: 0,
		fontWeight: "bold",
		lineHeight: 1.4,
	};

	const datasetCoordStyle = {
		color: "#ccc",
		fontSize: "12px",
		margin: "4px 0 0 0",
		whiteSpace: "nowrap",
	};

	const { center } = metadata;

	return (
		<div style={datasetRowStyle}>
			<div style={datasetInfoContainer}>
				<p style={datasetNameStyle}>{datasetName}</p>
				<p style={datasetCoordStyle}>Lat: {center[0].toFixed(4)}</p>
				<p style={datasetCoordStyle}>Lng: {center[1].toFixed(4)}</p>
			</div>
			<Tooltip title="Download dataset" arrow>
				<div>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							downloadDataset(datasetName);
						}}
						bg={accentColor}
						iconColor="#fff"
						icon={<DownloadSharpIcon />}
					/>
				</div>
			</Tooltip>
		</div>
	);
};

export default SelectedDatasetCard;
