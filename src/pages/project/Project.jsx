import React from 'react';

import { Alert } from '@material-ui/lab';

import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import Loading from '../../components/Loading';

import NotFoundPage from '../NotFoundPage';

import ViewProjectPage from './ViewProject';
import EditProjectPage from './EditProject';
import ManageTokensPage from './ManageTokens';

import NewUpdatePage from './update/NewUpdate';
import UpdatePage from './update/Update';

import { useAPI } from '../../api';

export default function ProjectPage({ user }) {

  const { path } = useRouteMatch();
  const { projectId } = useParams();

  const api = useAPI();
  const [ project, projectLoading, projectError ] = api.useProject(projectId);

  if(projectError) {
    console.error(projectError);
  }

  if(projectLoading) {
    return <Loading />;
  }

  if(projectError) {
    return <Alert severity="error">{projectError.message}</Alert>;
  }

  if(!project) {
    return <NotFoundPage />
  }

  return (
    <Switch>
      <Route exact path={path}><ViewProjectPage user={user} project={project} /></Route>
      <Route exact path={`${path}/edit`}><EditProjectPage user={user} project={project} /></Route>
      <Route exact path={`${path}/manage-tokens`}><ManageTokensPage user={user} project={project} /></Route>
      <Route exact path={`${path}/new-update`}><NewUpdatePage user={user} project={project} /></Route>
      <Route path={`${path}/update/:updateId`}><UpdatePage user={user} project={project}/></Route>

      <Route path="*"><NotFoundPage /></Route>
    </Switch>
  ); 
}