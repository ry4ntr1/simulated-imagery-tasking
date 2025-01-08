// SearchBar.js
import React, { useState, useRef, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({
	searchQuery,
	setSearchQuery,
	placeResults,
	datasets,
	onDatasetSelect,
	onPlaceSelect,
	onClearSearch,
	recentSearches = [],
	onClickRecentSearch,
	onRemoveRecentSearch,
	allDatasets = [],
}) => {
	const [focused, setFocused] = useState(false);
	const containerRef = useRef(null);

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

	const backgroundColor = "#fff";
	const textColor = "#121212";
	const borderColor = "#ccc";
	const hoverBackground = "#f1f1f1";

	const datasetsToShow = searchQuery ? datasets : allDatasets;
	const showDatasetSection = datasetsToShow && datasetsToShow.length > 0;
	const hasPlaces = placeResults && placeResults.length > 0;
	const hasRecentSearches =
		!searchQuery && recentSearches && recentSearches.length > 0;
	const hasResults = hasPlaces || showDatasetSection || hasRecentSearches;

	const inputContainerStyle = {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		position: "relative",
		backgroundColor,
		borderRadius: "8px",
		padding: "4px 8px",
		border: `1px solid ${borderColor}`,
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
	};

	const dropdownStyle = {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		marginTop: "4px",
		backgroundColor,
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
		zIndex: 2500,
		maxHeight: "300px",
		overflowY: "auto",
		border: `1px solid ${borderColor}`,
	};

	const sectionHeaderStyle = {
		fontWeight: "bold",
		fontSize: "14px",
		padding: "6px",
		textTransform: "uppercase",
		color: "#121212",
		borderBottom: `1px solid ${borderColor}`,
		backgroundColor,
	};

	const resultItemStyle = {
		padding: "8px",
		cursor: "pointer",
		color: textColor,
		fontSize: "14px",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		transition: "background-color 0.2s",
	};

	const handleItemHover = (e, hover) => {
		e.currentTarget.style.backgroundColor = hover
			? hoverBackground
			: "transparent";
	};

	const showDropdown = focused && hasResults;

	return (
		<div style={inputContainerStyle} ref={containerRef}>
			<SearchIcon style={{ color: textColor, fontSize: "20px" }} />
			<input
				type="text"
				style={inputStyle}
				placeholder="Search..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={() => setFocused(true)}
			/>
			{searchQuery && (
				<button
					onClick={onClearSearch}
					style={{
						zIndex: 1,
						background: "none",
						border: "none",
						padding: 0,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: textColor,
					}}
				>
					<ClearIcon style={{ fontSize: "20px" }} />
				</button>
			)}

			{showDropdown && (
				<div className="search-dropdown" style={dropdownStyle}>
					{hasRecentSearches && (
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
									<Tooltip>
										<button
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: textColor,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
											onClick={(e) => {
												e.stopPropagation();
												onRemoveRecentSearch(search.id);
											}}
										>
											<ClearIcon style={{ fontSize: "16px" }} />
										</button>
									</Tooltip>
								</div>
							))}
						</>
					)}

					{showDatasetSection && (
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

					{hasPlaces && (
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
				</div>
			)}
		</div>
	);
};

export default SearchBar;
