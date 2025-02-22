import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AuthDialog from "./AuthDialog.js";
import { useNavigate, useLocation } from "react-router-dom";
import { toAsciiFriendly } from "./utils/friendlyUrl";
import Sidebar from "./components/Sidebar";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const drawerWidth = 280;

//
// ContentViewer Component
//
function ContentViewer({ docUrl, selectedTitle }) {
  const getExtension = (url) => {
    if (url.startsWith("data:")) {
      const match = url.match(/data:([^;]+);/);
      if (match) {
        const mime = match[1];
        if (mime === "application/pdf") return "pdf";
        if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
          return "docx";
        if (mime === "application/msword") return "doc";
      }
      return "";
    }
    const parts = url.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const ext = docUrl ? getExtension(docUrl) : null;
  const [docxHtml, setDocxHtml] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const contentRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(null);

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

  useEffect(() => {
    if (!contentRef.current) return;
    const updateWidth = () => {
      const margin = isMobile ? 16 : 40;
      setPageWidth(contentRef.current.offsetWidth - margin);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isMobile]);

  if (!docUrl) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
        <Typography variant="body1">
          Please select a document from the sidebar.
        </Typography>
      </Box>
    );
  }

  if (ext === "pdf") {
    if (selectedTitle && selectedTitle.endsWith("(Raw)")) {
      return (
        <Box ref={contentRef} sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
          <iframe src={docUrl} title="Raw PDF" style={{ width: "100%", height: "100%", border: "none" }} />
        </Box>
      );
    } else {
      return (
        <Box ref={contentRef} sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
          <Document file={docUrl}>
            {pageWidth && <Page pageNumber={1} width={pageWidth} />}
          </Document>
        </Box>
      );
    }
  } else if (ext === "docx") {
    return (
      <Box sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
        {docxHtml ? (
          <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
        ) : (
          <Typography variant="body1">Loading DOCX...</Typography>
        )}
      </Box>
    );
  } else if (ext === "doc") {
    return (
      <Box sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
        <Typography variant="body1">
          DOC files cannot be previewed.{" "}
          <a href={docUrl} download>
            Download file
          </a>
          .
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}>
        <iframe src={docUrl} title="Document Content" style={{ width: "100%", height: "100%", border: "none" }} />
      </Box>
    );
  }
}

//
// Main App Component
//
function App() {
  const [manifest, setManifest] = useState(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      fetch("/docs_manifest.json").then((res) => res.json()),
      fetch("/docs_media_manifest.json").then((res) => res.json()),
    ])
      .then(([docManifest, mediaManifest]) => {
        const merged = { ...docManifest, ...mediaManifest };
        setManifest(merged);
      })
      .catch((err) => console.error("Error loading manifests:", err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const titleParam = params.get("title");
    const urlParam = params.get("url");
    if (titleParam && urlParam) {
      setSelectedTitle(titleParam);
      setSelectedDocUrl(urlParam);
      document.title = titleParam;
    }
  }, [location.search]);

  useEffect(() => {
    if (!manifest) return;
    const rawPath = location.pathname
      .substr(1)
      .replace(/\/+$/, "") // remove trailing slashes
      .replace(/\.(html|pdf|docx?|pptx?)$/i, ""); // remove extension
    const decodedPath = decodeURIComponent(rawPath);
    let friendlyPath = toAsciiFriendly(decodedPath).toLowerCase();
    if (friendlyPath.startsWith("docs_html/")) {
      friendlyPath = friendlyPath.substring("docs_html/".length);
    }
    console.log("DEBUG: Extracted friendlyPath:", friendlyPath);
    let viewSuffix = "";
    if (friendlyPath.endsWith("-raw")) {
      viewSuffix = "-raw";
      friendlyPath = friendlyPath.slice(0, -4);
    }
  
    function findFile(node) {
      for (const key in node) {
        const item = node[key];
        if (typeof item === "object" && item !== null) {
          if (item.friendly_url && item.friendly_url.toLowerCase() === friendlyPath) {
            // Ensure the URL starts with "/"
            const fileUrl = item.html_url.startsWith("/") ? item.html_url : "/" + item.html_url;
            const rawFileUrl = item.raw_url.startsWith("/") ? item.raw_url : "/" + item.raw_url;
            return {
              title: key,
              url: (viewSuffix === "-raw" && item.raw_url) ? rawFileUrl : fileUrl,
            };
          }
          const found = findFile(item);
          if (found) return found;
        }
      }
      return null;
    }
  
    const result = findFile(manifest);
    console.log("DEBUG: findFile result:", result);
    if (result) {
      setSelectedTitle(result.title);
      setSelectedDocUrl(result.url);
      document.title = result.title;
    }
  }, [manifest, location.pathname]);

  const handleSelect = (title, url, friendlyUrl) => {
    const extMatch = url.match(/\.(html|pdf|docx?|pptx?)$/i);
    const extension = extMatch ? extMatch[0] : '';
    if (!friendlyUrl) {
      friendlyUrl = toAsciiFriendly(title).toLowerCase();
    }
    // Form newPath for navigation.
    const newPath = `/${friendlyUrl}${extension}`;
    console.log("DEBUG: handleSelect newPath:", newPath);
    setSelectedTitle(title);
    setSelectedDocUrl(url.startsWith("/") ? url : "/" + url);
    document.title = title;
    navigate(newPath);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const tree = manifest || {};

  const drawer = (
    <Sidebar tree={tree} onSelect={handleSelect} selectedTitle={selectedTitle} />
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" noWrap component="div">
              {selectedTitle || "Sahaja Yoga Library"}
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, overflowX: "hidden" },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, overflowX: "hidden" },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: isMobile ? 8 : 0,
        }}
      >
        <Suspense fallback={<div>Loading Document...</div>}>
          <ContentViewer docUrl={selectedDocUrl} selectedTitle={selectedTitle} />
        </Suspense>
      </Box>
    </Box>
  );
}

export default App;
