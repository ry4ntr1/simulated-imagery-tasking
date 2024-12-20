import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";

const RecentSearches = ({
	recentSearches,
	onClickSearch,
	onRemoveSearch,
	accentColor,
	textColor,
	borderColor,
}) => {
	const containerStyle = {
		backgroundColor: "rgba(0,0,0,0.4)",
		backdropFilter: "blur(8px)",
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		maxHeight: "200px",
		overflow: "hidden",
	};

	const headerStyle = {
		fontWeight: "bold",
		fontSize: "14px",
		color: "#aaa",
		textTransform: "uppercase",
		padding: "16px",
		borderBottom: `1px solid ${borderColor}`,
		flexShrink: 0,
	};

	const listContainerStyle = {
		overflowY: "auto",
		flexGrow: 1,
		padding: "8px 16px",
		boxSizing: "border-box",
	};

	const cardStyle = {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "transparent",
		padding: "8px 12px",
		borderRadius: "4px",
		marginBottom: "8px",
		cursor: "pointer",
		transition: "background-color 0.2s",
	};

	const cardNameStyle = {
		color: textColor,
		fontSize: "14px",
		flexGrow: 1,
		marginRight: "8px",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
	};

	const handleCardHover = (e, hover) => {
		e.currentTarget.style.backgroundColor = hover
			? "rgba(255,255,255,0.1)"
			: "transparent";
	};

	const removeButtonStyle = {
		background: "none",
		border: "none",
		cursor: "pointer",
		color: "#fff",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	return (
		<div style={containerStyle}>
			<div style={headerStyle}>Recent Searches</div>
			<div style={listContainerStyle}>
				{recentSearches.map((search) => (
					<div
						key={search.id}
						style={cardStyle}
						onMouseEnter={(e) => handleCardHover(e, true)}
						onMouseLeave={(e) => handleCardHover(e, false)}
					>
						<div style={cardNameStyle} onClick={() => onClickSearch(search)}>
							{search.name}
						</div>
						<Tooltip title="Remove from recent" arrow>
							<button
								style={removeButtonStyle}
								onClick={(e) => {
									e.stopPropagation();
									onRemoveSearch(search.id);
								}}
							>
								<CloseIcon style={{ fontSize: "16px", color: "#fff" }} />
							</button>
						</Tooltip>
					</div>
				))}
			</div>
		</div>
	);
};

export default RecentSearches;
