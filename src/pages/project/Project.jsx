import React from 'react';

import { Alert } from '@material-ui/lab';

import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import Loading from '../../components/Loading';

import NotFoundPage from '../NotFoundPage';

import ViewProjectPage from './ViewProject';
import EditProjectPage from './EditProject';

import { useAPI } from '../../api';

export default function ProjectPage({ user }) {

  const { path } = useRouteMatch();
  const { projectId } = useParams();

  const api = useAPI();
  const [ project, projectLoading, projectError ] = api.useProject(projectId);

  if(projectError) {
    console.error(projectError);
  }

  return (
    <AuthenticatedLayout user={user} project={project}>
      {projectLoading? <Loading /> :
       projectError? <Alert severity="error">{projectError.message}</Alert> :
       !project? <NotFoundPage /> :
        <Switch>
          <Route exact path={path}><ViewProjectPage user={user} project={project} /></Route>
          <Route exact path={`${path}/edit`}><EditProjectPage user={user} project={project} /></Route>
          
          <Route path="*"><NotFoundPage /></Route>
        </Switch>
      }
    </AuthenticatedLayout>
  ); 
}