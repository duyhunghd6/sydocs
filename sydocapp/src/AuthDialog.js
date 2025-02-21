import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";

const AuthDialog = ({ open, onClose, onAuth }) => {
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    onAuth(password);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Authentication Required</DialogTitle>
      <DialogContent>
        <p>Ky thuat khi muon tro luc cho nguoi khac goi la gi?</p>
        <TextField
          autoFocus
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAuth();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAuth} variant="contained" color="primary">
          Go
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
