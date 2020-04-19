import React from 'react';

import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Alert } from "@material-ui/lab";

import { useAuthState } from './api';

import Loading from './components/Loading';
import { PrivateRoute } from './utils/routeHelpers';

import NotFoundPage from './pages/NotFoundPage';

import SignUpPage from './pages/user/SignUpPage';
import LogInPage from './pages/user/LogInPage';
import PasswordResetPage from './pages/user/PasswordResetPage';

import HomePage from './pages/HomePage';

import UserProfilePage from './pages/user/UserProfilePage';

import NewProjectPage from './pages/project/NewProject';
import ProjectPage from './pages/project/Project';

/**
 * Root component, responsible for routing and global redirections
 */
export default function App() {

  const [ user, userInitalizing, userError ] = useAuthState();
  const isAuthenticated = (user !== null && user !== undefined);

  if(userInitalizing) {
    return <Loading />;
  }

  if(userError) {
    console.error(userError);
    return <Alert severity="error">{userError.message}</Alert>;
  }

  return (
    <BrowserRouter>
      <Switch>
        
        <Route exact path="/signup"><SignUpPage /></Route>
        <Route exact path="/login"><LogInPage /></Route>
        <Route exact path="/password-reset"><PasswordResetPage /></Route>

        <PrivateRoute isAuthenticated={isAuthenticated} exact path="/"><HomePage user={user} /></PrivateRoute>
        <PrivateRoute isAuthenticated={isAuthenticated} exact path="/profile"><UserProfilePage user={user} /></PrivateRoute>
        <PrivateRoute isAuthenticated={isAuthenticated} exact path="/new-project"><NewProjectPage user={user} /></PrivateRoute>
        <PrivateRoute isAuthenticated={isAuthenticated} path="/project/:projectId"><ProjectPage user={user} /></PrivateRoute>

        <Route path="*"><NotFoundPage /></Route>
      </Switch>
    </BrowserRouter>
  );
}