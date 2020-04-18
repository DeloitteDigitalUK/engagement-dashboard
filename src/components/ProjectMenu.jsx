import React from 'react';

import { Link as RouterLink } from "react-router-dom";

import { makeStyles, Link, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

export const useStyles = makeStyles((theme) => ({
  projectTitle: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    borderLeft: "solid white 1px",
  },
  projectEditButton: {
    padding: theme.spacing(0, 1),
    fontSize: '1rem',
    marginTop: '-2px'
  }
}));

export default function ProjectMenu({ user, project }) {

  const classes = useStyles();

  return (
    <>
      <Link to={`/project/${project.getId()}`} component={RouterLink} variant="subtitle2" color="inherit" noWrap underline="none" className={classes.projectTitle}>
        {project.name}
      </Link>
      <IconButton to={`/project/${project.getId()}/edit`} component={RouterLink} color="inherit" className={classes.projectEditButton}>
        <EditIcon fontSize="inherit" />
      </IconButton>
    </>
  );
}