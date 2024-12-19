import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBar = ({
	searchQuery,
	setSearchQuery,
	accentColor,
	textColor,
	borderColor,
	isMobile,
}) => {
	const inputStyle = {
		border: `1px solid ${borderColor}`,
		borderRadius: "4px",
		height: "32px",
		color: textColor,
		backgroundColor: "#333",
		padding: "0 8px",
		fontSize: "14px",
		flex: 1,
		boxSizing: "border-box",
		transition: "border-color 0.2s",
	};

	const inputContainerStyle = {
		display: "flex",
		gap: "8px",
		marginBottom: "12px",
		marginTop: isMobile ? "48px" : "0px",
	};

	return (
		<div style={inputContainerStyle}>
			<input
				type="text"
				style={inputStyle}
				placeholder="Search datasets..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
				onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
			/>
			{searchQuery && (
				<Tooltip title="Clear search" arrow>
					<div>
						<Button
							onClick={() => setSearchQuery("")}
							bg={accentColor}
							iconColor={textColor}
							icon={<ClearIcon />}
						/>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default SearchBar;
