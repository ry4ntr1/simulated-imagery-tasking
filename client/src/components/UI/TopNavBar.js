// TopNavBar.js
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const TopNavBar = ({ polygonCount, onCartClick }) => {
	// Decide which bookmark icon to show
	const BookmarkIconComponent =
		polygonCount > 0 ? BookmarkIcon : BookmarkBorderIcon;

	return (
		<AppBar
			position="fixed"
			sx={{
				backgroundColor: "#121212",
				height: "56px",
				minHeight: "56px",
			}}
		>
			<Toolbar
				variant="dense"
				disableGutters
				sx={{
					height: "56px !important",
					minHeight: "56px !important",
					lineHeight: "56px !important",
					px: 2,
				}}
			>
				{/* Logo */}
				<Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
					<a
						href="https://albedo.com/"
						target="_blank"
						rel="noopener noreferrer"
						style={{ textDecoration: "none" }}
					>
						<img
							src="/albedo-white.png"
							alt="Albedo Logo"
							style={{ height: 40, cursor: "pointer" }}
						/>
					</a>
				</Box>

				{/* Spacer */}
				<Box sx={{ flexGrow: 1 }} />

				{/* "View Saved Areas" Button/Icon */}
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Tooltip title="View Saved Areas" arrow>
						<IconButton sx={{ color: "#fff" }} onClick={onCartClick}>
							<Badge badgeContent={polygonCount} color="error">
								<BookmarkIconComponent />
							</Badge>
						</IconButton>
					</Tooltip>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default TopNavBar;
