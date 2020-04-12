import React, { useState } from 'react';

import { Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

export default function SignUpPage() {

  const classes = useAnonymousStyles();
  const firebase = useFirebase();

  const [ errorMessage, setErrorMessage ] = useState(null);

  const signUp = async ({ name, email, password }) => {
    try {
      const user = await firebase.signUp(name, email, password);
      // TODO: Redirect to home page
      alert("Logged in as " + user.displayName);
    } catch(error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  }

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Sign up">
      <Formik
        initialValues={{
          'name': "",
          'email': "",
          'password': "",
          'confirmPassword': ""
        }}
        validationSchema={Yup.object({
          name: Yup.string("Enter your name").required("Name is required"),
          email: Yup.string("Enter your email address").email("Invalid email address").required("Email is required"),
          password: Yup.string("Enter your password").min(8, "Password must contain at least 8 characters").required("Password is required"),
          confirmPassword: Yup.string("Confirm your password").required("Please confirm your password").oneOf([Yup.ref("password")], "Passwords do not match")
        })}
        onSubmit={async (values, { setSubmitting }) => {
          await signUp(values);
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
                  id="name"
                  name="name"
                  label="Name"
                  autoComplete="name"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  required
                />
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
              <Grid item xs={12}>
                <Field
                    component={TextField}
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm password"
                    autoComplete="confirm-password"
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
              Sign up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="#" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </AnonymousLayout>
  );

}