import React from "react";

import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Divider,
  Link,
  makeStyles,
 } from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

import AuthenticatedLayout from '../layouts/AuthenticatedLayout';

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

const ProjectCard = ({ project }) => {
  const classes = useStyles();
  
  return (
    <Card variant="outlined" className={classes.projectCard}>
      <Link to={project.url} component={RouterLink} underline="none">
        <CardContent className={classes.projectCardContent}>
          <Typography color="textPrimary" variant="h5">{project.name}</Typography>
          <Typography color="textSecondary">{project.description}</Typography>
        </CardContent>
      </Link>
      <CardActions>
        {project.canEdit && <Button size="small">Edit</Button>}
      </CardActions>
    </Card>
  );
}

export default function HomePage({ user }) {

  const classes = useStyles();
  const projects = [];

  return (
    <AuthenticatedLayout user={user}>

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
        <Grid item xs={12} md={6} lg={4}>
          <ProjectCard project={{canEdit: true, url: "/one", name: "Alpha", description: "A short description for Alpha"}} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ProjectCard project={{canEdit: false, url: "/two", name: "Beta", description: "Sint esse labore do incididunt tempor aute adipisicing. Duis qui sint ipsum id duis aute ipsum id sunt voluptate cillum aliqua dolor. Labore incididunt eiusmod duis sunt qui do ut ullamco nisi. Minim ex reprehenderit et excepteur nulla id eiusmod excepteur ullamco quis culpa enim. Elit officia nostrud ut reprehenderit laboris consectetur ut nostrud consectetur Lorem. Cillum dolor exercitation sint dolor nisi dolor nisi amet tempor. Magna consectetur voluptate reprehenderit laboris eu incididunt nostrud."}} />
        </Grid>
    </Grid>

    <Divider className={classes.divider} />

    <Grid container>
      <Grid item>
        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} to="/new-project" component={RouterLink}>
          New project
        </Button>
      </Grid>
    </Grid>

    </AuthenticatedLayout>
  );
}