import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Document, Page } from "react-pdf";
import mammoth from "mammoth";
import TableOfContents from "./TableOfContents";

/* Helper to determine media type */
function getMediaType(url) {
  if (/youtu\.be|youtube\.com/i.test(url)) return "youtube";
  if (/soundcloud\.com/i.test(url)) return "soundcloud";
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
  const mediaType = docUrl ? getMediaType(docUrl) : null;

  useEffect(() => {
    if (!contentRef.current) return;
    const updateWidth = () => {
      if (contentRef.current) {
        setPageWidth(contentRef.current.offsetWidth - (isMobile ? 32 : 40));
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
      const embedUrl =
        "https://www.youtube.com/embed/" +
        videoId +
        "?rel=0&showinfo=0&controls=1";
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
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      );
    } else {
      console.error("Invalid YouTube URL:", docUrl);
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
            width: "100%",
          }}
        >
          <iframe
            src={docUrl}
            title="Raw PDF"
            style={{ width: "100%", height: "100%", border: "none" }}
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
            overflow: "auto",
            width: "100%",
          }}
        >
          <Document file={docUrl}>
            <Page
              pageNumber={1}
              width={pageWidth}
              scale={isMobile ? 0.8 : 1}
            />
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
  } else {
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
          src={docUrl}
          title="Document Content"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </Box>
    );
  }
}

export default ContentViewer;
