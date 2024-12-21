import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import VisibilityOffSharpIcon from "@mui/icons-material/VisibilityOffSharp";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";

const MapControls = ({
	accentColor,
	textColor,
	onShareLinkClick,
	onToggleVisibility,
	tilesVisible,
	selectedDataset,
	downloadDataset,
}) => {
	const buttonContainerStyle = {
		position: "absolute",
		top: "16px",
		right: "16px",
		display: "flex",
		alignItems: "center",
		gap: "8px",
		zIndex: 10,
	};

	return (
		<div style={buttonContainerStyle}>
			<Tooltip title="Get shareable link" arrow>
				<div>
					<Button
						onClick={onShareLinkClick}
						bg={accentColor}
						iconColor={textColor}
						icon={<LinkSharpIcon />}
					/>
				</div>
			</Tooltip>

			<Tooltip title="Toggle dataset visibility" arrow>
				<div>
					<Button
						onClick={onToggleVisibility}
						bg={accentColor}
						iconColor={textColor}
						icon={
							tilesVisible ? (
								<VisibilitySharpIcon />
							) : (
								<VisibilityOffSharpIcon />
							)
						}
					/>
				</div>
			</Tooltip>

			{selectedDataset && (
				<Tooltip title={`Download ${selectedDataset}`} arrow>
					<div>
						<Button
							onClick={() => downloadDataset(selectedDataset)}
							bg={accentColor}
							iconColor={textColor}
							icon={<DownloadSharpIcon />}
						/>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default MapControls;
