import React from 'react';

import { Alert } from '@material-ui/lab';

import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import Loading from '../../components/Loading';

import ViewProjectPage from './ViewProject';
import EditProjectPage from './EditProject';
import { useFirebase } from '../../firebase';

export default function ProjectPage({ user }) {

  const { path } = useRouteMatch();
  const { projectId } = useParams();

  const firebase = useFirebase();
  const [ project, projectLoading, projectError ] = firebase.useProject(projectId);

  if(projectError) {
    console.error(projectError);
  }

  return (
    <AuthenticatedLayout user={user} project={project}>
      {projectLoading? <Loading /> :
       projectError? <Alert severity="error">{projectError.message}</Alert> :
        <Switch>
          <Route exact path={path}><ViewProjectPage user={user} project={project} /></Route>
          <Route exact path={`${path}/edit`}><EditProjectPage user={user} project={project} /></Route>
        </Switch>
      }
    </AuthenticatedLayout>
  ); 
}