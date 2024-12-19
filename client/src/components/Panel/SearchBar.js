import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "../UI/Button";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBar = ({
	searchQuery,
	setSearchQuery,
	placeResults,
	datasets,
	onDatasetSelect,
	onPlaceSelect,
	onClearSearch,
	accentColor,
	textColor,
	borderColor,
	isMobile,
}) => {
	const [focused, setFocused] = useState(false);

	const inputStyle = {
		border: "none",
		borderBottom: `1px solid ${borderColor}`,
		borderRadius: "0px",
		height: "32px",
		color: textColor,
		backgroundColor: "transparent",
		padding: "0 8px",
		fontSize: "14px",
		flex: 1,
		boxSizing: "border-box",
	};

	const inputContainerStyle = {
		display: "flex",
		gap: "8px",
		position: "relative",
		backgroundColor: "transparent",
	};

	const dropdownStyle = {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		marginTop: "4px",
		backgroundColor: "#2f2f2f",
		border: `1px solid ${borderColor}`,
		borderRadius: "4px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
		zIndex: 2500,
		maxHeight: "300px",
		overflowY: "auto",
	};

	const sectionHeaderStyle = {
		fontWeight: "bold",
		fontSize: "12px",
		padding: "8px",
		textTransform: "uppercase",
		color: "#aaa",
		borderBottom: `1px solid ${borderColor}`,
	};

	const resultItemStyle = {
		padding: "8px",
		cursor: "pointer",
		color: "#fff",
		fontSize: "14px",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		transition: "background-color 0.2s",
	};

	const handleItemHover = (e, hover) => {
		e.currentTarget.style.backgroundColor = hover ? "#3a3a3a" : "transparent";
	};

	const showDropdown =
		focused && (placeResults.length > 0 || datasets.length > 0);

	return (
		<div style={inputContainerStyle}>
			<input
				type="text"
				style={inputStyle}
				placeholder="Search places or datasets..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={() => setFocused(true)}
				onBlur={() => setTimeout(() => setFocused(false), 200)}
			/>
			{searchQuery && (
				<Tooltip title="Clear search" arrow>
					<div style={{ pointerEvents: "auto" }}>
						<Button
							onClick={onClearSearch}
							bg={accentColor}
							iconColor={textColor}
							icon={<ClearIcon />}
						/>
					</div>
				</Tooltip>
			)}

			{showDropdown && (
				<div style={dropdownStyle}>
					{placeResults.length > 0 && (
						<>
							<div style={sectionHeaderStyle}>Places</div>
							{placeResults.map((place) => (
								<div
									key={place.id}
									style={resultItemStyle}
									onMouseEnter={(e) => handleItemHover(e, true)}
									onMouseLeave={(e) => handleItemHover(e, false)}
									onClick={() => onPlaceSelect(place)}
								>
									{place.place_name || place.text}
								</div>
							))}
						</>
					)}
					{datasets.length > 0 && (
						<>
							<div style={sectionHeaderStyle}>Datasets</div>
							{datasets.map((d) => (
								<div
									key={d.name}
									style={resultItemStyle}
									onMouseEnter={(e) => handleItemHover(e, true)}
									onMouseLeave={(e) => handleItemHover(e, false)}
									onClick={() => onDatasetSelect(d.name)}
								>
									{d.name}
								</div>
							))}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchBar;
