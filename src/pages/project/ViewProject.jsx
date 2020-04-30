import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

import {
  Typography,
  Menu,
  MenuItem,
  Button,
  Card,
  Link,
  CardContent,
  Box,
  FormControl,
  Select,
  makeStyles,
} from '@material-ui/core';
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { Alert } from '@material-ui/lab';

import { Roles, UpdateTypes } from 'models';

import { useAPI } from '../../api';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import Loading from '../../components/Loading';
import updateViews from '../../components/update';

const useStyles = makeStyles((theme) => ({
  toolbarControl: {
    minWidth: 120,
    marginRight: theme.spacing(2)
  },
  updateCard: {
    marginTop: theme.spacing(2)
  }
}));

function FilterToolbar({
  project, canAdd,
  updateType, setUpdateType,
  team, setTeam
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);

  const history = useHistory();
  const classes = useStyles();

  function redirectToAddForm(type) {
    return () => {
      history.push(`/project/${project.id}/new-update?type=${type}`)
    }
  }

  return (
    <Box my={2} display="flex" flexDirection="row">

      <Box flexGrow="1">

        {project.updateTypes && project.updateTypes.length > 0 && <>
          <FormControl className={classes.toolbarControl} color="primary">
            <Select
              displayEmpty
              value={updateType}
              onChange={e => setUpdateType(e.target.value)}
            >
              <MenuItem value="-">All update types</MenuItem>
              {project.updateTypes.includes(UpdateTypes.goals) && <MenuItem value={UpdateTypes.goals}>Goals</MenuItem>}
              {project.updateTypes.includes(UpdateTypes.insights) && <MenuItem value={UpdateTypes.insights}>Insights</MenuItem>}
              {project.updateTypes.includes(UpdateTypes.release) && <MenuItem value={UpdateTypes.release}>Releases</MenuItem>}
              {project.updateTypes.includes(UpdateTypes.raid) && <MenuItem value={UpdateTypes.raid}>RAID items</MenuItem>}
              {project.updateTypes.includes(UpdateTypes.flow) && <MenuItem value={UpdateTypes.flow}>Flow</MenuItem>}
            </Select>
          </FormControl>
        </>}
        
        {project.teams && project.teams.length > 0 && <>
          <FormControl className={classes.toolbarControl} color="primary">
            <Select
              displayEmpty
              value={team}
              onChange={e => setTeam(e.target.value)}
            >
              <MenuItem value="-">All teams</MenuItem>
              {project.teams.map((t, idx) => <MenuItem key={idx} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </>}
      </Box>

      <Box>

        {canAdd && <>
          <Button
            type="button"
            variant="text"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={(e) => { setAnchorElement(e.target); setMenuOpen(true); }}
            className={classes.addUpdateButton}
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
        </>}
      </Box>
    </Box>
  );
}

function UpdateCard({ project, update }) {

  const classes = useStyles();

  const views = updateViews[update.type];
  const UpdateView = views? views.summaryView : <Alert severity="error">Update type {update.type} not found for update {update.id}!</Alert>;

  return (
    <Card variant="outlined" className={classes.updateCard}>
      <Link to={`/project/${project.id}/update/${update.id}`} component={RouterLink} underline="none">
        <CardContent>
          <UpdateView update={update} />
        </CardContent>
      </Link>
    </Card>
  );
}

export default function ViewProjectPage({ user, project }) {

  const api = useAPI();
  const [updateType, setUpdateType] = useState("-");
  const [team, setTeam] = useState("-");

  const [ updates, loading, error ] = api.useUpdates(
    project,
    team !== "-"? team : null,
    updateType !== "-"? updateType : null
  );

  if(error) {
    console.error(error);
  }
  
  const canEdit = project.hasRole(user.email, [Roles.owner, Roles.administrator]);
  const canAdd = project.hasRole(user.email, [Roles.owner, Roles.administrator, Roles.author]);

  const editLink = `/project/${project.id}/edit`;

  return (
    <AuthenticatedLayout user={user} project={project} editLink={canEdit? editLink : null}>
      <Typography component="h2" variant="h3" gutterBottom>{project.name}</Typography>
      <Typography paragraph>{project.description}</Typography>


      <FilterToolbar {...{project, canAdd, updateType, setUpdateType, team, setTeam}} />
      
      <Box my={2}>

        {loading && <Loading />}
        {error && <Alert severity="error">{error.message}</Alert>}
        {updates && updates.map(update => <UpdateCard key={update.id} project={project} update={update} />)}

        {updates && updates.length === 0 && <>
          <Alert severity="warning">No updates found</Alert>
        </>}

      </Box>
    </AuthenticatedLayout>
  );
}