import React, { useState, useRef, useEffect } from "react";
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
	recentSearches = [],
	onClickRecentSearch,
	onRemoveRecentSearch,
	allDatasets, // All datasets for when no query is present
}) => {
	const [focused, setFocused] = useState(false);
	const containerRef = useRef(null);

	// Handle clicks outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const inputContainerStyle = {
		display: "flex",
		gap: "8px",
		position: "relative",
		backgroundColor: "rgba(0,0,0,0.4)",
		backdropFilter: "blur(8px)",
		borderRadius: "8px",
		padding: "4px 8px",
		boxSizing: "border-box",
	};

	const inputStyle = {
		border: "none",
		outline: "none",
		height: "32px",
		color: textColor,
		backgroundColor: "transparent",
		padding: "0 8px",
		fontSize: "14px",
		flex: 1,
		boxSizing: "border-box",
		transition: "box-shadow 0.3s",
		...(focused && {
			boxShadow: `0 0 8px ${accentColor}`,
		}),
	};

	const dropdownStyle = {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		marginTop: "4px",
		backgroundColor: "rgba(0,0,0,0.6)",
		backdropFilter: "blur(8px)",
		borderRadius: "8px",
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
		e.currentTarget.style.backgroundColor = hover
			? "rgba(255,255,255,0.1)"
			: "transparent";
	};

	// If no query, we show all datasets
	const datasetsToShow = searchQuery ? datasets : allDatasets;

	const hasResults =
		(placeResults && placeResults.length > 0) ||
		(datasetsToShow && datasetsToShow.length > 0) ||
		(!searchQuery && recentSearches && recentSearches.length > 0);

	const showDropdown = focused && hasResults;

	return (
		<div style={inputContainerStyle} ref={containerRef}>
			<input
				type="text"
				style={inputStyle}
				placeholder="Search places or datasets..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={() => setFocused(true)}
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
					{/* Show recent searches if no query */}
					{!searchQuery && recentSearches && recentSearches.length > 0 && (
						<>
							<div style={sectionHeaderStyle}>Recent Searches</div>
							{recentSearches.map((search) => (
								<div
									key={search.id}
									style={resultItemStyle}
									onMouseEnter={(e) => handleItemHover(e, true)}
									onMouseLeave={(e) => handleItemHover(e, false)}
								>
									<div
										onClick={() => onClickRecentSearch(search)}
										style={{
											flexGrow: 1,
											marginRight: "8px",
											overflow: "hidden",
											whiteSpace: "nowrap",
											textOverflow: "ellipsis",
										}}
									>
										{search.name}
									</div>
									<Tooltip title="Remove from recent" arrow>
										<button
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "#fff",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
											onClick={(e) => {
												e.stopPropagation();
												onRemoveRecentSearch(search.id);
												// Removing recent search does not close dropdown since we no longer rely on blur
											}}
										>
											<ClearIcon style={{ fontSize: "16px", color: "#fff" }} />
										</button>
									</Tooltip>
								</div>
							))}
						</>
					)}

					{/* Show places if query and results exist */}
					{searchQuery && placeResults && placeResults.length > 0 && (
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

					{/* Show datasets (either all if no query, or filtered if query is present) */}
					{datasetsToShow && datasetsToShow.length > 0 && (
						<>
							<div style={sectionHeaderStyle}>Datasets</div>
							{datasetsToShow.map((d) => (
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
