import React, { useState, useEffect } from "react";
import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  Box
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { toAsciiFriendly } from "../utils/friendlyUrl";

function Sidebar({ tree, onSelect, selectedTitle }) {
  const [openFolders, setOpenFolders] = useState(() => {
    const stored = localStorage.getItem("sidebarOpenFolders");
    return stored ? JSON.parse(stored) : {};
  });

  const handleToggle = (folderPath) => {
    setOpenFolders((prev) => {
      const newState = { ...prev, [folderPath]: !prev[folderPath] };
      localStorage.setItem("sidebarOpenFolders", JSON.stringify(newState));
      return newState;
    });
  };

  // Check if a node is a dual-view file
  const isDualViewFile = (obj) =>
    typeof obj === "object" &&
    obj !== null &&
    ("html_url" in obj && "raw_url" in obj && "friendly_url" in obj);

  const getRawFileIcon = (rawUrl) => {
    const ext = rawUrl.split(".").pop().toLowerCase();
    const iconProps = { sx: { fontSize: "12px" } };
    if (ext === "pdf") return <PictureAsPdfIcon {...iconProps} />;
    if (ext === "doc" || ext === "docx") return <DescriptionIcon {...iconProps} />;
    if (ext === "ppt" || ext === "pptx") return <SlideshowIcon {...iconProps} />;
    return <InsertDriveFileIcon {...iconProps} />;
  };

  const renderTree = (node, level = 0, path = "") =>
    Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;
      if (isDualViewFile(value)) {
        return (
          <ListItem
            // removed button prop
            component="div"
            key={currentPath}
            sx={{ pl: 1 + level, py: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(key, value.html_url, value.friendly_url);
            }}
          >
            <ListItemText
              primary={
                <span
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <span>{key}</span>
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(key, value.raw_url, value.friendly_url);
                    }}
                  >
                    {getRawFileIcon(value.raw_url)}
                  </IconButton>
                </span>
              }
              primaryTypographyProps={{
                variant: "body2",
                sx: {
                  fontSize: "0.7rem",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                  p: 0,
                },
              }}
            />
          </ListItem>
        );
      } else if (typeof value === "string") {
        const isSelected = selectedTitle === key;
        return (
          <ListItem
            // removed button prop
            component="div"
            key={currentPath}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(key, value);
            }}
            sx={{
              pl: 1 + level,
              bgcolor: isSelected ? "grey.300" : "inherit",
              borderRadius: isSelected ? 1 : 0,
              py: 0.2,
            }}
          >
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: "body2",
                sx: {
                  fontSize: "0.8rem",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                  p: 0,
                },
              }}
            />
          </ListItem>
        );
      } else if (typeof value === "object" && value !== null) {
        // If folder is empty
        if (Object.keys(value).length === 0) {
          return (
            <ListItem
              // removed button prop
              component="div"
              key={currentPath}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(key, null);
              }}
              sx={{ pl: 1 + level, py: 0.2 }}
            >
              <ListItemText
                primary={key}
                primaryTypographyProps={{
                  variant: "body2",
                  sx: {
                    fontSize: "0.8rem",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: 1.2,
                    p: 0,
                  },
                }}
              />
            </ListItem>
          );
        }
        const isOpen = openFolders[currentPath] || false;
        return (
          <React.Fragment key={currentPath}>
            <ListItem
              // removed button prop
              component="div"
              onClick={() => handleToggle(currentPath)}
              sx={{ pl: 1 + level, py: 0.2, minHeight: "28px" }}
            >
              <ListItemText
                primary={key}
                primaryTypographyProps={{
                  variant: "subtitle2",
                  fontWeight: "bold",
                  style: {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: 1.2,
                    padding: 0,
                  },
                }}
              />
              {isOpen ? (
                <ExpandLess style={{ fontSize: "1.2rem" }} />
              ) : (
                <ExpandMore style={{ fontSize: "1.2rem" }} />
              )}
            </ListItem>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense>
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
      <Typography variant="h6" sx={{ p: 1 }}>
        Sahaja Yoga Docs
      </Typography>
      <Divider />
      {/* Use dense here to reduce item padding globally */}
      <List dense>
        {tree ? renderTree(tree, 0, "") : null}
      </List>
    </Box>
  );
}

export default Sidebar;
