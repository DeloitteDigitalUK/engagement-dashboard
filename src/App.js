import React from 'react';

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { Alert } from "@material-ui/lab";

import { useAuthState } from './firebase';

import Loading from './components/Loading';

import NotFoundPage from './pages/NotFoundPage';

import SignUpPage from './pages/user/SignUpPage';
import LogInPage from './pages/user/LogInPage';
import PasswordResetPage from './pages/user/PasswordResetPage';

import HomePage from './pages/HomePage';

import UserProfilePage from './pages/user/UserProfilePage';

import NewProjectPage from "./pages/project/NewProject";

const PrivateRoute = ({ isAuthenticated, children, ...rest }) => (
  <Route
    {...rest}
    render={({ location }) =>
      isAuthenticated ? (
        children
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: location }
          }}
        />
      )
    }
  />
);

/**
 * Root component, responsible for routing and global redirections
 */
export default function App() {

  const [user, userInitalizing, userError] = useAuthState();
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

        <Route path="*"><NotFoundPage /></Route>
      </Switch>
    </BrowserRouter>
  );
}