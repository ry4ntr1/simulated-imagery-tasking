import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";

/**
 * TopNavBar
 * - Forces Toolbar to 56px in height
 * - variant="dense" + inline !important overrides
 */
const TopNavBar = ({ polygonCount, onCartClick }) => {
	return (
		<AppBar
			position="static"
			sx={{
				backgroundColor: "#121212",
				// In case MUI tries to expand, also set appBar's height
				height: "56px",
				minHeight: "56px",
				// Make sure there's no extra margin/padding:
				padding: 0,
			}}
		>
			<Toolbar
				variant="dense"
				disableGutters
				// Force 56px with !important so MUI variants don’t override
				sx={{
					height: "56px !important",
					minHeight: "56px !important",
					lineHeight: "56px !important",
					px: 2, // optional side padding
				}}
			>
				{/* Logo linking to https://albedo.com */}
				<Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
					<a
						href="https://albedo.com/"
						target="_blank"
						rel="noopener noreferrer"
						style={{ textDecoration: "none" }}
					>
						<img
							src="/albedo-white.png"
							alt="Logo"
							style={{ height: 40, cursor: "pointer" }}
						/>
					</a>
				</Box>

				{/* Spacer to push icons right */}
				<Box sx={{ flexGrow: 1 }} />

				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					{/* Orders */}
					<IconButton sx={{ color: "#fff" }}>
						<HistoryIcon />
					</IconButton>

					{/* Account */}
					<IconButton sx={{ color: "#fff" }}>
						<PersonIcon />
					</IconButton>

					{/* Cart */}
					<IconButton sx={{ color: "#fff" }}>
						<Badge
							badgeContent={polygonCount}
							color="error"
							onClick={onCartClick}
						>
							<ShoppingCartIcon />
						</Badge>
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default TopNavBar;
