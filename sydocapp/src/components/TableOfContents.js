import React from "react";
import { Box, Typography } from "@mui/material";

function TableOfContents({ tree, onSelect }) {
  const renderContent = (node, level = 0) => {
    return Object.entries(node).map(([key, value]) => {
      // If the node is a folder (and not a dual-view file) then render as section header
      if (value && typeof value === "object" && !value.html && !value.raw) {
        return (
          <Box key={key} sx={{ ml: level * 2, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {key}
            </Typography>
            {renderContent(value, level + 1)}
          </Box>
        );
      }
      // Otherwise render as a clickable file link
      const url = typeof value === "string" ? value : value.html;
      return (
        <Box key={key} sx={{ ml: level * 2, mb: 1 }}>
          <Typography
            variant="body1"
            component="a"
            sx={{
              cursor: "pointer",
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => onSelect(key, url)}
          >
            {key}
          </Typography>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sahaja Yoga Docs
      </Typography>
      {renderContent(tree)}
    </Box>
  );
}

export default TableOfContents;
