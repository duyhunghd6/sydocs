import React, { useEffect, useState } from "react";

function DocBrowser() {
  const [docs, setDocs] = useState({});

  // Fetch the manifest JSON when the component mounts
  useEffect(() => {
    fetch("/docs_manifest.json")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Error loading manifest:", err));
  }, []);

  // A recursive function to render the directory tree
  const renderDocs = (docsObj) => {
    return Object.entries(docsObj).map(([key, value]) => {
      if (typeof value === "string") {
        // Render file links
        return (
          <li key={value}>
            <a href={value} target="_blank" rel="noopener noreferrer">
              {key}
            </a>
          </li>
        );
      } else {
        // Render folder names and recursively render their content
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
    <div>
      <h1>sydoc Documents</h1>
      <ul>{renderDocs(docs)}</ul>
    </div>
  );
}

export default DocBrowser;
