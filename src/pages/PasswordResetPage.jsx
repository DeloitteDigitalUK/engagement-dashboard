import React, { useState } from 'react';
import { Link as RouterLink } from "react-router-dom";

import { Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

const formSchema = Yup.object({
  email: Yup.string("Enter your email address").email("Invalid email address").required("Email is required"),
});

const knownErrors = {
  'auth/user-not-found': "Please check your email for further instructions."
}

export default function PasswordResetPage() {

  const classes = useAnonymousStyles();
  const firebase = useFirebase();

  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ statusMessage, setStatusMessage ] = useState(null);

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Reset password">
      <Formik
        validationSchema={formSchema}
        initialValues={formSchema.default()}
        onSubmit={async ({ email }, { setSubmitting }) => {
          setStatusMessage(null);
          try {
            await firebase.sendPasswordResetEmail(email);
            setStatusMessage("Please check your email for further instructions.");
          } catch(error) {
            if(error.code in knownErrors) {
              setErrorMessage(knownErrors[error.code]);
            } else {
              console.log(error);
              setErrorMessage(error.message);
            }
          }
          setSubmitting(false);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className={classes.form} noValidate>
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
              <Link variant="body2" to="/login" component={RouterLink}>
                  Remember your password? Log in
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </AnonymousLayout>
  );


}