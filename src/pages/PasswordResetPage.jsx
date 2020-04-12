import React, { useState } from 'react';

import { Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

export default function PasswordResetPage() {

  const classes = useAnonymousStyles();
  const firebase = useFirebase();

  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ statusMessage, setStatusMessage ] = useState(null);

  const logIn = async ({ email }) => {
    try {
      await firebase.sendPasswordResetEmail(email);
      setStatusMessage("Please check your email for further instructions.");
    } catch(error) {
      if(error.code === 'auth/user-not-found') {
        setStatusMessage("Please check your email for further instructions.");
      } else {
        console.error(error);
        setErrorMessage(error.message);
      }
    }
  }

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Reset password">
      <Formik
        initialValues={{
          'email': "",
        }}
        validationSchema={Yup.object({
          email: Yup.string("Enter your email address").email("Invalid email address").required("Email is required"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setStatusMessage(null);
          await logIn(values);
          setSubmitting(false);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {errorMessage && <Alert className={classes.alert} severity="error">{errorMessage}</Alert>}
                {statusMessage && <Alert className={classes.alert} severity="info">{statusMessage}</Alert>}
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
              Send instructions
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