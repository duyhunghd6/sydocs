import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Document, Page } from "react-pdf";
import mammoth from "mammoth";
import TableOfContents from "./TableOfContents";
import YouTube from 'react-youtube'; // Import react-youtube

/* Helper to determine media type */
function getMediaType(url) {
  console.log("URL:", url); // Debugging log
  if (!url) return null;
  if (/youtu\.be|youtube\.com/i.test(url)) {
    console.log("Identified as YouTube"); // Debugging log
    return "youtube";
  }
  if (/soundcloud\.com/i.test(url)) {
    console.log("Identified as SoundCloud"); // Debugging log
    return "soundcloud";
  }
  console.log("Not identified as YouTube or SoundCloud"); // Debugging log
  return null;
}

function ContentViewer({ docUrl, selectedTitle, manifest, handleSelect, onBack }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageWidth, setPageWidth] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const contentRef = useRef(null);

  const getExtension = (url) => {
    if (url.startsWith("data:")) {
      const match = url.match(/data:([^;]+);/);
      if (match) {
        const mime = match[1];
        if (mime === "application/pdf") return "pdf";
        if (
          mime ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
          return "docx";
        if (mime === "application/msword") return "doc";
      }
      return "";
    }
    const parts = url.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const ext = docUrl ? getExtension(docUrl) : null;
  console.log("DEBUG: ContentViewer docUrl:", docUrl, "extension:", ext);
  
  const mediaType = docUrl ? getMediaType(docUrl) : null;

  useEffect(() => {
    if (!contentRef.current) return;
    const updateWidth = () => {
      if (contentRef.current) {
        const margin = isMobile ? 16 : 40; // reduced margin for mobile
        setPageWidth(contentRef.current.offsetWidth - margin);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isMobile]);

  useEffect(() => {
    if (docUrl && ext === "docx") {
      fetch(docUrl)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
        .then((result) => {
          setDocxHtml(result.value);
        })
        .catch((err) => console.error("Error converting DOCX:", err));
    } else {
      setDocxHtml(null);
    }
  }, [docUrl, ext]);

  console.log("ContentViewer docUrl:", docUrl, "mediaType:", mediaType); // Debugging log

  // Process YouTube URLs by embedding players.
  if (docUrl && mediaType === "youtube") {
    const trimmedUrl = docUrl.trim();
    let videoId = null;
    try {
      if (trimmedUrl.includes("youtube.com/watch") || trimmedUrl.includes("youtube.com/embed/")) {
        const urlObj = new URL(trimmedUrl);
        if (trimmedUrl.includes("youtube.com/embed/")) {
          videoId = urlObj.pathname.split("/").pop();
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      } else if (trimmedUrl.includes("youtu.be/")) {
        videoId = trimmedUrl.split("youtu.be/")[1].split(/[?&]/)[0];
      }
    } catch (err) {
      console.error("Error parsing YouTube URL:", err);
    }
    if (videoId) {
      const opts = {
        height: '480',
        width: '100%',
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 0,
        },
      };

      return (
        <Box
          ref={contentRef}
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            height: "calc(100vh - 64px)",
            overflow: "auto",
            width: "100%",
          }}
        >
          <YouTube videoId={videoId} opts={opts} />
        </Box>
      );
    } else {
      console.error("Invalid YouTube URL:", docUrl);
      return <Typography>Invalid YouTube URL</Typography>;
    }
  } else if (docUrl && mediaType === "soundcloud") {
    return (
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          height: "calc(100vh - 64px)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(docUrl)}&color=%23ff5500&inverse=false&auto_play=false&show_user=true`}
        ></iframe>
      </Box>
    );
  }

  if (!docUrl) {
    return (
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          height: "calc(100vh - 64px)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <TableOfContents tree={manifest || {}} onSelect={handleSelect} />
      </Box>
    );
  }

  if (ext === "pdf") {
    if (selectedTitle && selectedTitle.endsWith("(Raw)")) {
      return (
        <Box
          ref={contentRef}
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            height: "calc(100vh - 64px)",
            overflow: "auto",
            overflowX: isMobile ? "hidden" : "auto", // changed for mobile
            width: "100%",
          }}
        >
          <iframe
            src={docUrl}
            title="Raw PDF"
            style={{
              width: "100%",
              height: isMobile ? "calc(100vh - 100px)" : "100%",
              border: "none",
            }}
          />
        </Box>
      );
    } else {
      return (
        <Box
          ref={contentRef}
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            height: "calc(100vh - 64px)",
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
            overflowX: "auto", // added for horizontal responsiveness
            width: "100%",
          }}
        >
          <Document file={docUrl}>
            {pageWidth && <Page pageNumber={1} width={pageWidth} scale={isMobile ? 0.8 : 1} />}
          </Document>
        </Box>
      );
    }
  } else if (ext === "docx") {
    return (
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          height: "calc(100vh - 64px)",
          overflow: "auto",
          overflowX: "auto", // ensures responsive horizontal scrolling
          width: "100%",
          "& img": { maxWidth: "100%", height: "auto" },
        }}
      >
        {docxHtml ? (
          <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
        ) : (
          <Typography variant="body1">Loading DOCX...</Typography>
        )}
      </Box>
    );
  } else if (ext === "html") { // New branch for HTML files
    const designedWidth = 800;
    // Use the container width from our ref (or default to designedWidth if not set)
    const currentWidth = contentRef.current ? contentRef.current.offsetWidth : designedWidth;
    const scaleFactor = Math.min(1, currentWidth / designedWidth);
    return (
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          height: "calc(100vh - 64px)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: designedWidth,
            mx: "auto",
            transform: `scale(${scaleFactor})`,
            transformOrigin: "top left",
            // Adjust the container height to account for scaling
            height: `calc((100vh - 64px) / ${scaleFactor})`,
          }}
        >
          <iframe
            src={docUrl}
            title="HTML Document"
            style={{
              width: designedWidth,
              height: "calc(100vh - 64px)",
              border: "none",
            }}
          />
        </Box>
      </Box>
    );
  } else {
    if (docUrl && mediaType !== "youtube") {
      return (
        <Box
          ref={contentRef}
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            height: "calc(100vh - 64px)",
            overflow: "auto",
            overflowX: isMobile ? "hidden" : "auto", // changed for mobile
            width: "100%",
          }}
        >
          <iframe
            src={docUrl}
            title="Document Content"
            style={{
              width: "100%",
              height: isMobile ? "calc(100vh - 100px)" : "100%",
              border: "none",
            }}
          />
        </Box>
      );
    } else {
      return null;
    }
  }
}

export default ContentViewer;
