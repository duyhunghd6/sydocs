import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

function DocBrowser() {
  const [docs, setDocs] = useState({});

  useEffect(() => {
    fetch("/docs_manifest.json")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Error loading manifest:", err));
  }, []);

  const renderDocs = (docsObj) => {
    return Object.entries(docsObj).map(([key, value]) => {
      if (typeof value === "string") {
        return (
          <li key={value}>
            <a href={value} target="_blank" rel="noopener noreferrer">
              {key}
            </a>
          </li>
        );
      } else {
        return (
          <li key={key}>
            <strong>{key}</strong>
            <ul>{renderDocs(value)}</ul>
          </li>
        );
      }
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: "100%", overflowX: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        sydoc Documents
      </Typography>
      <ul>{renderDocs(docs)}</ul>
    </Box>
  );
}

export default DocBrowser;
