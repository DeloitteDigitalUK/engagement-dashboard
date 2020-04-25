import React, { useState } from 'react';

import { Link as RouterLink, useHistory } from "react-router-dom";

import { makeStyles, Link, IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/AddCircleOutline';

import { Roles, UpdateTypes } from 'models';

export const useStyles = makeStyles((theme) => ({
  projectTitle: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    borderLeft: "solid white 1px",
  },
  projectEditButton: {
    padding: theme.spacing(0, 0, 0, 1),
    fontSize: '1rem',
    marginTop: '-2px'
  },
  addUpdateButton: {
    fontSize: '1rem',
  },
  addUpdateButtonIcon: {
    margin: theme.spacing(0, 0.5)
  }
}));

export default function ProjectMenu({ user, project }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);
  
  const classes = useStyles();
  const history = useHistory();
  
  function redirectToAddForm(type) {
    return () => {
      history.push(`/project/${project.getId()}/new-update?type=${type}`)
    }
  }

  return (
    <>
      <Link to={`/project/${project.getId()}`} component={RouterLink} variant="subtitle2" color="inherit" noWrap underline="none" className={classes.projectTitle}>
        {project.name}
      </Link>
      {project.hasRole(user.email, [Roles.owner, Roles.administrator]) && (
        <IconButton to={`/project/${project.getId()}/edit`} component={RouterLink} color="inherit" className={classes.projectEditButton}>
          <EditIcon fontSize="inherit" />
        </IconButton>
      )}
      {project.hasRole(user.email, [Roles.owner, Roles.administrator, Roles.author]) && (
        <>
          <IconButton
            aria-label="Add update menu"
            aria-controls="menu-add-update"
            aria-haspopup="true"
            onClick={(e) => { setAnchorElement(e.target); setMenuOpen(true); }}
            color="inherit"
            className={classes.addUpdateButton}
          >
            <AddIcon fontSize="inherit" className={classes.addUpdateButtonIcon} />
            <Typography variant="subtitle2" >New update</Typography>
          </IconButton>
          <Menu
            id="menu-add-update"
            anchorEl={anchorElement}
            keepMounted
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
          >
            <MenuItem onClick={redirectToAddForm(UpdateTypes.goals)}>Goals</MenuItem>
            <MenuItem onClick={redirectToAddForm(UpdateTypes.raid)}>RAID</MenuItem>
            <MenuItem onClick={redirectToAddForm(UpdateTypes.insights)}>Insights</MenuItem>
            <MenuItem onClick={redirectToAddForm(UpdateTypes.release)}>Release</MenuItem>
            <MenuItem onClick={redirectToAddForm(UpdateTypes.flow)}>Team flow</MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}