import React, { useState } from 'react';

import { Link as RouterLink, useHistory } from "react-router-dom";

import { makeStyles, Link, IconButton, Toolbar, Box, Button, Typography, Menu, MenuItem, Hidden } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';

import { useAPI } from '../api';

export const useStyles = makeStyles((theme) => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  title: {
    flexGrow: 1,
  },
  projectTitle: {
    margin: theme.spacing(0, 1),
    paddingLeft: theme.spacing(1),
    borderLeft: "solid white 1px",
  },
  updateTitle: {
    margin: theme.spacing(0, 1),
  },
  editButton: {
    marginRight: theme.spacing(1)
  },
  userName: {
    marginLeft: theme.spacing(1)
  }
}));

export default function AuthenticatedToolbar({ user, project, update, editLink=null }) {

  const classes = useStyles();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);

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
    <Toolbar className={classes.toolbar}>
      <Box className={classes.title}>
        <Link to="/" component={RouterLink} variant="subtitle1" color="inherit" noWrap underline="none">
          <Hidden smDown>Engagement Dashboard</Hidden>
          <Hidden mdUp>ED</Hidden>
        </Link>
        {project &&
          <>
            <Link to={`/project/${project.id}`} component={RouterLink} variant="subtitle2" color="inherit" noWrap underline="none" className={classes.projectTitle}>
            {project.name}
            </Link>
            {update && (
              <>
                &bull;
                <Link to={`/project/${project.id}/update/${update.id}`} component={RouterLink} variant="subtitle2" color="inherit" noWrap underline="none" className={classes.updateTitle}>
                  {update.title}
                </Link>
              </>
            )}
          </>
        }
      </Box>

      {editLink && <Button type="button" variant="contained" className={classes.editButton} component={RouterLink} to={editLink}>Edit</Button>}

      <IconButton
        aria-label="Current user account"
        aria-controls="menu-user-profile"
        aria-haspopup="true"
        onClick={(e) => { setAnchorElement(e.target); setMenuOpen(true); }}
        color="inherit"
      >
        <AccountCircle />
        <Hidden smDown><Typography component="small" className={classes.userName}>{user.displayName}</Typography></Hidden>
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
    </Toolbar>

  );
}