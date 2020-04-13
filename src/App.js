import React from 'react';

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { Alert } from "@material-ui/lab";

import { useAuthState } from './firebase';

import Loading from './components/Loading';

import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import PasswordResetPage from './pages/PasswordResetPage';

const PrivateRoute = ({ isLoggedIn, children, ...rest }) => (
  <Route
    {...rest}
    render={({ location }) =>
      isLoggedIn ? (
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
  const isLoggedIn = (user !== null && user !== undefined);

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
        
        <Route path="/signup"><SignUpPage /></Route>
        <Route path="/login"><LogInPage /></Route>
        <Route path="/password-reset"><PasswordResetPage /></Route>

        <PrivateRoute isLoggedIn={isLoggedIn} path="/">TODO: Home page for {user && user.displayName}</PrivateRoute>

      </Switch>
    </BrowserRouter>
  );
}