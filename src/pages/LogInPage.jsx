import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from "react-router-dom";

import { Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

const formSchema = Yup.object({
  email: Yup.string("Enter your email address").email("Invalid email address").required("Email is required").default(""),
  password: Yup.string("Enter your password").required("Password is required").default(""),
});

const knownErrors = {
  'auth/user-disabled': "This user has been disabled.",
  'auth/user-not-found': "Incorrect email address or password.",
  'auth/wrong-password': "Incorrect email address or password."
};

export default function LogInPage() {

  const classes = useAnonymousStyles();
  const firebase = useFirebase();
  const history = useHistory();

  const [ errorMessage, setErrorMessage ] = useState(null);

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Log in">
      <Formik
        validationSchema={formSchema}
        initialValues={formSchema.default()}
        onSubmit={async ({ email, password }, { setSubmitting }) => {
          try {
            await firebase.logIn(email, password);      
            history.push('/');
          } catch(error) {
            if(error.code in knownErrors) {
              setErrorMessage(knownErrors[error.code]);
            } else {
              console.log(error);
              setErrorMessage(error.message);
            }
            setSubmitting(false);
          }
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className={classes.form} noValidate>
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
            <Grid container justify="space-between">
              <Grid item>
                <Link variant="body2" to="/password-reset" component={RouterLink}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link variant="body2" to="/signup" component={RouterLink}>
                  Create new account
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </AnonymousLayout>
  );


}