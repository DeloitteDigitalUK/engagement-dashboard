import React, { useState } from 'react';

import { useHistory } from "react-router-dom";

import { IconButton, MenuItem, Menu, Typography, makeStyles } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';

import { useAPI } from '../api';

export const useStyles = makeStyles((theme) => ({
  userName: {
    marginLeft: theme.spacing(1)
  }
}));

export default function UserMenu({ user }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);

  const classes = useStyles();
  const history = useHistory();
  const api = useAPI();

  const handleProfile = () => {
    setMenuOpen(false);
    history.push('/profile');
  };

  const handleLogOut = () => {
    setMenuOpen(false);
    api.logOut();
    // App will automatically redirect to login now
  }

  return (
    <>
      <IconButton
        aria-label="Current user account"
        aria-controls="menu-user-profile"
        aria-haspopup="true"
        onClick={(e) => { setAnchorElement(e.target); setMenuOpen(true); }}
        color="inherit"
      >
        <AccountCircle />
        <Typography component="small" className={classes.userName}>{user.displayName}</Typography>
      </IconButton>
      <Menu
        id="menu-user-profile"
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogOut}>Log out</MenuItem>
      </Menu>
    </>
  );
}