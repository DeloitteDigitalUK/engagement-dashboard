import React, { useState } from 'react';

import { Typography, Menu, MenuItem, Button } from '@material-ui/core';
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";

import { Roles, UpdateTypes } from 'models';
import { useHistory } from 'react-router-dom';

export default function ViewProjectPage({ user, project }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);

  const history = useHistory();
  
  const canEdit = project.hasRole(user.email, [Roles.owner, Roles.administrator]);
  const editLink = `/project/${project.id}/edit`;

  function redirectToAddForm(type) {
    return () => {
      history.push(`/project/${project.id}/new-update?type=${type}`)
    }
  }

  return (
    <AuthenticatedLayout user={user} project={project} editLink={canEdit? editLink : null}>
      <Typography component="h2" variant="h3" gutterBottom>{project.name}</Typography>
      <Typography paragraph>{project.description}</Typography>

      <Button
        type="button"
        variant="contained"
        color="primary"
        startIcon={<AddCircleOutlineIcon />}
        onClick={(e) => { setAnchorElement(e.target); setMenuOpen(true); }}
      >
        New update
      </Button>

      <Menu
        id="menu-add-update"
        anchorEl={anchorElement}
        keepMounted
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        {project.updateTypes.includes(UpdateTypes.goals) && <MenuItem onClick={redirectToAddForm(UpdateTypes.goals)}>Goals</MenuItem>}
        {project.updateTypes.includes(UpdateTypes.insights) && <MenuItem onClick={redirectToAddForm(UpdateTypes.insights)}>Insights</MenuItem>}
        {project.updateTypes.includes(UpdateTypes.release) && <MenuItem onClick={redirectToAddForm(UpdateTypes.release)}>Release</MenuItem>}
        {project.updateTypes.includes(UpdateTypes.raid) && <MenuItem onClick={redirectToAddForm(UpdateTypes.raid)}>RAID</MenuItem>}
        {project.updateTypes.includes(UpdateTypes.flow) && <MenuItem onClick={redirectToAddForm(UpdateTypes.flow)}>Team flow</MenuItem>}
      </Menu>

    </AuthenticatedLayout>
  );
}