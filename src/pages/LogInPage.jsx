import React, { useState } from 'react';

import { Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

export default function LogInPage() {

  const classes = useAnonymousStyles();
  const firebase = useFirebase();

  const [ errorMessage, setErrorMessage ] = useState(null);

  const logIn = async ({ email, password }) => {
    try {
      const user = await firebase.logIn(email, password);
      // TODO: Redirect to home page
      alert("Logged in as " + user.displayName);
    } catch(error) {
      console.error(error);
      setErrorMessage(
        error.code === 'auth/user-disabled'? "This user has been disabled." :
        error.code === 'auth/user-not-found' || error.code == 'auth/wrong-password'? "Incorrect email address or password." :
        error.message
      );
    }
  }

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Log in">
      <Formik
        initialValues={{
          'email': "",
          'password': "",
        }}
        validationSchema={Yup.object({
          email: Yup.string("Enter your email address").email("Invalid email address").required("Email is required"),
          password: Yup.string("Enter your password").required("Password is required"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          await logIn(values);
          setSubmitting(false);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {errorMessage && <Alert className={classes.alert} severity="error">{errorMessage}</Alert>}
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  id="email"
                  name="email"
                  label="Email Address"
                  autoComplete="email"
                  variant="outlined"
                  autoFocus
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  type="password"
                  id="password"
                  name="password"
                  label="Password"
                  autoComplete="current-password"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Log in
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </AnonymousLayout>
  );


}