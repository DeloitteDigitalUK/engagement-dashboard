import React, { useState } from 'react';

import { useHistory } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import { IconButton, MenuItem, Menu, Typography } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';

import { useFirebase } from '../firebase';

export const useStyles = makeStyles((theme) => ({
  userName: {
    'margin-left': theme.spacing(1)
  }
}));

export default function UserMenu({ user }) {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const history = useHistory();
  const firebase = useFirebase();

  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    history.push('/profile');
  };

  const handleLogOut = () => {
    handleClose();
    firebase.logOut();
    // App will automatically redirect to login now
  }

  return (
    <>
      <IconButton
        aria-label="Current user account"
        aria-controls="menu-user-profile"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
        <Typography component="small" className={classes.userName}>{user.displayName}</Typography>
      </IconButton>
      <Menu
        id="menu-user-profile"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogOut}>Log out</MenuItem>
      </Menu>
    </>
  );
}