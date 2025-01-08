// TopNavBar.js
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import Tooltip from "@mui/material/Tooltip"; // <-- Import Tooltip

const TopNavBar = ({ polygonCount, onCartClick }) => {
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

				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					{/* Orders */}
					<Tooltip title="Order History" arrow>
						<IconButton sx={{ color: "#fff" }}>
							<HistoryIcon />
						</IconButton>
					</Tooltip>

					{/* Account */}
					<Tooltip title="My Account" arrow>
						<IconButton sx={{ color: "#fff" }}>
							<PersonIcon />
						</IconButton>
					</Tooltip>

					{/* Cart */}
					<Tooltip title="Open Cart" arrow>
						<IconButton sx={{ color: "#fff" }} onClick={onCartClick}>
							<Badge badgeContent={polygonCount} color="error">
								<ShoppingCartIcon />
							</Badge>
						</IconButton>
					</Tooltip>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default TopNavBar;
