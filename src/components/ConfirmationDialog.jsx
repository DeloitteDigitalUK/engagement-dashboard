import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@material-ui/core';

export default function ConfirmationDialog({
  open,
  cancel,
  confirm,
  confirmColor="primary"
}) {
  return (
    <Dialog
      open={open}
      onClose={cancel}
      aria-labelledby="delete-confirm-title"
      aria-describedby="delete-confirm-description"
    >
      <DialogTitle id="delete-confirm-title">
        Are you sure?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-confirm-description">
          When you delete a project, all users will immediately lose
          access to it, and all updates will be permanently deleted.
          This action cannot be done.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel} color="primary">
          Cancel
        </Button>
        <Button onClick={confirm} color={confirmColor}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}