import React from "react";

import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  Link,
  makeStyles,
 } from "@material-ui/core";

import { Alert } from "@material-ui/lab";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

import { Roles } from 'models';

import { useAPI } from "../api";

import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import Loading from "../components/Loading";

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2, 0)
  },
  projectCard: {
    height: "100%"
  },
  projectCardContent: {
    height: theme.spacing(15),
    overflow: "hidden"
  }
}));

function ProjectCard({ user, project }) {
  const classes = useStyles();
  let canEdit;

  try {
    canEdit = project.hasRole(user.email, [Roles.owner, Roles.administrator]);
  } catch(e) {
    canEdit = true; // if the project is broken, try to let us edit/delete it (even if the sever-side might reject!)
  }

  const link = canEdit && project.error? `/project/${project.id}/edit` : `/project/${project.id}`;
  
  return (
    <Card variant="outlined" className={classes.projectCard}>
      <Link to={link} component={RouterLink} underline="none">
        <CardContent className={classes.projectCardContent}>
          <Typography color="textPrimary" variant="h5">{project.name}</Typography>
          {project.error?
            <Alert severity="error">This project is broken! You may be able to edit it.</Alert> : 
            <Typography color="textSecondary">{project.description}</Typography>
          }
        </CardContent>
      </Link>
    </Card>
  );
}

export default function HomePage({ user }) {
  
  const api = useAPI();
  const classes = useStyles();
  
  const [ projects, loading, error ] = api.useProjects(user);

  if(error) {
    console.error(error);
  }

  return (
    <AuthenticatedLayout user={user}>
      {loading? <Loading /> :
       error? <Alert severity="error">{error.message}</Alert> : <>
        <Box my={2}>
          <Typography variant="h3" component="h1" gutterBottom>Projects</Typography>
          
          {projects? (
            <Typography variant="body1" paragraph>
              Projects that you have access to are shown below. If you can't see a project you expect to,
              ask its administrator to give you access to it.
            </Typography>
          ) : (
            <Typography variant="subtitle2" paragraph>
              You do not have access to any projects yet. Click <em>New project</em> to create one.
          </Typography>
          )}
        </Box>
        
        <Grid container spacing={2}>
          {projects.map(project => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <ProjectCard project={project} user={user} />
            </Grid>
          ))}
        </Grid>

        <Divider className={classes.divider} />

        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} to="/new-project" component={RouterLink}>
          New project
        </Button>
      </>}

    </AuthenticatedLayout>
  );
}