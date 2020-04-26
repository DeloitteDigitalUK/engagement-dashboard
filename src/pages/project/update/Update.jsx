import React from 'react';

import { Alert } from '@material-ui/lab';

import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import Loading from '../../../components/Loading';
import NotFoundPage from '../../NotFoundPage';

// import ViewUpdatePage from './ViewUpdate';
// import EditUpdatePage from './EditUpdate';

import { useAPI } from '../../api';

export default function UpdatePage({ user, project }) {

  const { path } = useRouteMatch();
  const { updateId } = useParams();

  const api = useAPI();
  const [ update, updateLoading, updateError ] = api.useUpdate(project, updateId);

  if(updateError) {
    console.error(updateError);
  }

  return (
    updateLoading? <Loading /> :
    updateError? <Alert severity="error">{updateError.message}</Alert> :
    !update? <NotFoundPage /> :
    <Switch>
      {/* <Route exact path={path}><ViewUpdatePage user={user} project={project} update={update} /></Route>
      <Route exact path={`${path}/edit`}><EditUpdatePage user={user} project={project} update={update} /></Route> */}
      
      <Route path="*"><NotFoundPage /></Route>
    </Switch>
  ); 
}