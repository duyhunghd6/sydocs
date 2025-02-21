import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AuthDialog from "./AuthDialog";

function Sidebar({ tree, onSelect, selectedTitle }) {
  const [openFolders, setOpenFolders] = useState(() => {
    const stored = localStorage.getItem("sidebarOpenFolders");
    return stored ? JSON.parse(stored) : {};
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingAuthNode, setPendingAuthNode] = useState(null);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleToggle = (folderPath) => {
    setOpenFolders((prev) => {
      const newState = { ...prev, [folderPath]: !prev[folderPath] };
      localStorage.setItem("sidebarOpenFolders", JSON.stringify(newState));
      return newState;
    });
  };

  const handleAuth = (password) => {
    if (password === "kundalini") {
      setIsAuthenticated(true);
      setAuthDialogOpen(false);
      // (Optional) Could re-trigger a render if needed for pending nodes.
    } else {
      alert("Incorrect password");
    }
  };

  const handleAuthDialogOpen = (node) => {
    setPendingAuthNode(node);
    setAuthDialogOpen(true);
  };

  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
    setPendingAuthNode(null);
  };

  // Checks if the entry is a dual-view file (has "html" or "raw" property)
  const isDualViewFile = (obj) =>
    typeof obj === "object" && obj !== null && (obj.html || obj.raw);

  const getRawFileIcon = (rawUrl) => {
    const ext = rawUrl.split(".").pop().toLowerCase();
    const iconProps = { sx: { fontSize: "12px" } };
    if (ext === "pdf") return <PictureAsPdfIcon {...iconProps} />;
    if (ext === "doc" || ext === "docx")
      return <DescriptionIcon {...iconProps} />;
    if (ext === "ppt" || ext === "pptx")
      return <SlideshowIcon {...iconProps} />;
    return <InsertDriveFileIcon {...iconProps} />;
  };

  const renderTree = (node, level = 0, path = "") =>
    Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;

      if (value && value.protected && !isAuthenticated) {
        return (
          <ListItem
            button
            key={currentPath}
            sx={{ pl: 2 + level * 2, mb: 0.5 }}
          >
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: "subtitle1",
                fontWeight: "bold",
                style: { whiteSpace: "normal", wordBreak: "break-word" },
              }}
              onClick={() => handleAuthDialogOpen(node)}
            />
          </ListItem>
        );
      }
      if (isDualViewFile(value)) {
        const isHTMLSelected = selectedTitle === `${key} (HTML)`;
        const isRawSelected = selectedTitle === `${key} (Raw)`;
        return (
          <ListItem
            button
            key={currentPath}
            sx={{
              pl: 2 + level * 2,
              bgcolor: isHTMLSelected ? "grey.300" : "inherit",
              borderRadius: isHTMLSelected ? 1 : 0,
              mb: 0.5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(`${key} (HTML)`, value.html);
            }}
          >
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: "body1",
                sx: {
                  fontSize: "0.8rem",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }}
            />
            {value.raw && (
              <ListItemSecondaryAction>
                <IconButton
                  color={isRawSelected ? "secondary" : "primary"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(`${key} (Raw)`, value.raw);
                  }}
                >
                  {getRawFileIcon(value.raw)}
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        );
      } else if (typeof value === "string") {
        const isSelected = selectedTitle === key;
        return (
          <ListItem
            button
            key={currentPath}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(key, value);
            }}
            sx={{
              pl: 2 + level * 2,
              bgcolor: isSelected ? "grey.300" : "inherit",
              borderRadius: isSelected ? 1 : 0,
              mb: 0.5,
            }}
          >
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: "body1",
                sx: {
                  fontSize: "0.8rem",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }}
            />
          </ListItem>
        );
      } else if (typeof value === "object" && value !== null) {
        const isOpen = openFolders[currentPath] || false;
        return (
          <React.Fragment key={currentPath}>
            <ListItem
              button
              onClick={() => handleToggle(currentPath)}
              sx={{ pl: 2 + level * 2, mb: 0.5 }}
            >
              <ListItemText
                primary={key}
                primaryTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: "bold",
                  style: { whiteSpace: "normal", wordBreak: "break-word" },
                }}
              />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderTree(value, level + 1, currentPath)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }
      return null;
    });

  return (
    <Box sx={{ width: 280, overflowX: "hidden" }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Sahaja Yoga Docs
      </Typography>
      <Divider />
      <List>{renderTree(tree)}</List>
      <AuthDialog
        open={authDialogOpen}
        onClose={handleAuthDialogClose}
        onAuth={handleAuth}
      />
    </Box>
  );
}

export default Sidebar;
