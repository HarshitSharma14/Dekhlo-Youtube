import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const DeleteDialogBox = ({
  open,
  setOpen,
  deleteHandler,
  deleteText = "Are you sure to delete",
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    deleteHandler();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#1e1e1e",
          color: "#fff",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>{deleteText}? This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{
            color: "#ccc",
            borderColor: "#444",
            "&:hover": { backgroundColor: "#333" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          sx={{
            backgroundColor: "#d32f2f",
            color: "#fff",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialogBox;
