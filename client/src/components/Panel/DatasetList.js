import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";

const DatasetList = ({
	datasets,
	selectedDataset,
	onDatasetClick,
	downloadDataset,
	cardColor,
	accentColor,
	borderColor,
}) => {
	const datasetContainerStyle = {
		flex: 1,
		overflowY: "auto",
		paddingRight: "4px",
	};

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
		cursor: "pointer",
		transition: "box-shadow 0.2s, background-color 0.2s",
		boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
	};

	const datasetInfoContainer = {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		flexGrow: 1,
		marginRight: "8px",
	};

	const datasetNameStyle = (d) => ({
		color: d === selectedDataset ? accentColor : "#fff",
		fontSize: "15px",
		margin: 0,
		fontWeight: d === selectedDataset ? "bold" : "500",
		lineHeight: 1.4,
	});

	const datasetCoordStyle = {
		color: "#ccc",
		fontSize: "12px",
		margin: "4px 0 0 0",
		whiteSpace: "nowrap",
	};

	return (
		<div style={datasetContainerStyle}>
			{datasets.map((d) => {
				const { center } = d.metadata;
				return (
					<div
						key={d.name}
						style={datasetRowStyle}
						onClick={() => onDatasetClick(d.name)}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#383838";
							e.currentTarget.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.4)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = cardColor;
							e.currentTarget.style.boxShadow = "0px 1px 3px rgba(0,0,0,0.3)";
						}}
					>
						<div style={datasetInfoContainer}>
							<p style={datasetNameStyle(d.name)}>{d.name}</p>
							<p style={datasetCoordStyle}>Lat: {center[0].toFixed(4)}</p>
							<p style={datasetCoordStyle}>Lng: {center[1].toFixed(4)}</p>
						</div>
						<Tooltip title="Download dataset" arrow>
							<div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										downloadDataset(d.name);
									}}
									bg={accentColor}
									iconColor="#fff"
									icon={<DownloadSharpIcon />}
								/>
							</div>
						</Tooltip>
					</div>
				);
			})}
		</div>
	);
};

export default DatasetList;
