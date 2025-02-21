import React, { useState, useEffect } from "react";
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
import AuthDialog from "./AuthDialog.js"; // Add .js extension
import { useNavigate, useLocation } from "react-router-dom"; // <-- new import

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const drawerWidth = 280;

//
// Sidebar Component
//
function Sidebar({ tree, onSelect, selectedTitle }) {
  // Initialize openFolders from localStorage, or fallback to {}
  const [openFolders, setOpenFolders] = useState(() => {
    const stored = localStorage.getItem("sidebarOpenFolders");
    return stored ? JSON.parse(stored) : {};
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
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
      // If there's a pending node, re-render the tree
      if (pendingAuthNode) {
        renderTree(pendingAuthNode);
        setPendingAuthNode(null);
      }
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

  // Helper to check if an entry is a dual-view file.
  const isDualViewFile = (obj) =>
    typeof obj === "object" && obj !== null && (obj.html || obj.raw);

  // Helper function to get the appropriate icon based on file extension
  const getRawFileIcon = (rawUrl) => {
    const ext = rawUrl.split('.').pop().toLowerCase();
    const iconProps = { sx: { fontSize: "12px" } };
    if (ext === "pdf") return <PictureAsPdfIcon {...iconProps} />;
    if (ext === "doc" || ext === "docx") return <DescriptionIcon {...iconProps} />;
    if (ext === "ppt" || ext === "pptx") return <SlideshowIcon {...iconProps} />;
    return <InsertDriveFileIcon {...iconProps} />;
  };

  const renderTree = (node, level = 0, path = "") =>
    Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;

      if (value && value.protected && !isAuthenticated) {
        return (
          <ListItem button key={currentPath} sx={{ pl: 2 + level * 2, mb: 0.5 }}>
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

      // Case 1: Dual-view file entry.
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
              // Default click selects HTML view.
              onSelect(`${key} (HTML)`, value.html);
            }}
          >
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: "body1",
                sx: { fontSize: "0.8rem", whiteSpace: "normal", wordBreak: "break-word" }
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
      }
      // Case 2: Single-view file entry (string).
      else if (typeof value === "string") {
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
                sx: { fontSize: "0.8rem", whiteSpace: "normal", wordBreak: "break-word" }
              }}
            />
          </ListItem>
        );
      }
      // Case 3: Folder entry.
      else if (typeof value === "object" && value !== null) {
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
    <Box sx={{ width: drawerWidth, overflowX: "hidden" }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Library
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

//
// ContentViewer Component
//
// The useEffect hook is unconditionally called so that React Hooks are always called in the same order.
function ContentViewer({ docUrl, selectedTitle }) {
  // Enhanced getExtension: if docUrl is a data URL, extract mime type.
  const getExtension = (url) => {
    if (url.startsWith("data:")) {
      // Example: "data:application/pdf;base64,..." 
      const match = url.match(/data:([^;]+);/);
      if (match) {
        const mime = match[1];
        if (mime === "application/pdf") return "pdf";
        if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
          return "docx";
        if (mime === "application/msword") return "doc";
      }
      // Fallback if mime not matched.
      return "";
    }
    const parts = url.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const ext = docUrl ? getExtension(docUrl) : null;
  const [docxHtml, setDocxHtml] = useState(null);

  useEffect(() => {
    if (docUrl && ext === "docx") {
      // Fetch the DOCX file as an ArrayBuffer and convert it using Mammoth.
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

  if (!docUrl) {
    return (
      <Box
        sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
      >
        <Typography variant="body1">
          Please select a document from the sidebar.
        </Typography>
      </Box>
    );
  }

  // Render PDF.
  if (ext === "pdf") {
    // Use iframe if the raw view is selected; otherwise use react-pdf.
    if (selectedTitle && selectedTitle.endsWith("(Raw)")) {
      return (
        <Box
          sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
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
          sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
        >
          <Document file={docUrl}>
            {/* Render first page for demo */}
            <Page pageNumber={1} width={window.innerWidth - drawerWidth - 40} />
          </Document>
        </Box>
      );
    }
  }
  // Render DOCX using Mammoth.
  else if (ext === "docx") {
    return (
      <Box
        sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
      >
        {docxHtml ? (
          <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
        ) : (
          <Typography variant="body1">Loading DOCX...</Typography>
        )}
      </Box>
    );
  }
  // For DOC files, which are not supported by Mammoth, show a download link.
  else if (ext === "doc") {
    return (
      <Box
        sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
      >
        <Typography variant="body1">
          DOC files cannot be previewed.{" "}
          <a href={docUrl} download>
            Download file
          </a>
          .
        </Typography>
      </Box>
    );
  }
  // Fallback: use an iframe for other file types.
  else {
    return (
      <Box
        sx={{ flexGrow: 1, p: 3, height: "calc(100vh - 64px)", overflow: "auto" }}
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

  const navigate = useNavigate(); // <-- new hook
  const location = useLocation(); // <-- new hook

  /* Fetch both docs_manifest.json and docs_media_manifest.json, then merge them */
  useEffect(() => {
    Promise.all([
      fetch("/docs_manifest.json").then((res) => res.json()),
      fetch("/docs_media_manifest.json").then((res) => res.json()),
    ])
      .then(([docManifest, mediaManifest]) => {
        // Shallow merge; adjust for deep merge if needed.
        const merged = { ...docManifest, ...mediaManifest };
        setManifest(merged);
      })
      .catch((err) => console.error("Error loading manifests:", err));
  }, []);

  // Initialize state from URL query params
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

  const handleSelect = (title, url) => {
    setSelectedTitle(title);
    setSelectedDocUrl(url);
    document.title = title;
    navigate(`/?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
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
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {selectedTitle || "My Library"}
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
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                overflowX: "hidden",
              },
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
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                overflowX: "hidden",
              },
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
        <ContentViewer docUrl={selectedDocUrl} selectedTitle={selectedTitle} />
      </Box>
    </Box>
  );
}

export default App;
