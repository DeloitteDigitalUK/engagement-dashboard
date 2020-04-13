import React, { useState } from 'react';

import { Button, Grid, Typography, Divider } from '@material-ui/core';
import { Alert } from "@material-ui/lab";

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AuthenticatedLayout, { useAuthenticatedStyles } from '../layouts/AuthenticatedLayout';
import { useFirebase } from '../firebase';

const profileSchema = Yup.object({
  name: Yup.string("Enter your name").required("Name is required").default(""),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string("Enter your current password").required("Current password is required").default(""),
  newPassword: Yup.string("Enter your new password").min(8, "Password must contain at least 8 characters").required("New password is required").default(""),
  confirmPassword: Yup.string("Confirm your password").required("Please confirm your password").oneOf([Yup.ref("newPassword")], "Passwords do not match").default("")
});

const knownErrors = {
  'auth/wrong-password': "Your current password is incorrect.",
  'auth/weak-password': "Your new password is too simple. Please pick a longer/more complex password."
}

export default function UserProfilePage({ user }) {

  const firebase = useFirebase();
  const classes = useAuthenticatedStyles();

  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ statusMessage, setStatusMessage ] = useState(null);

  return (
    <AuthenticatedLayout user={user}>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          {errorMessage && <Alert className={classes.alert} severity="error">{errorMessage}</Alert>}
          {statusMessage && <Alert className={classes.alert} severity="success">{statusMessage}</Alert>}
        </Grid>
      </Grid>

      <Formik
        validationSchema={profileSchema}
        initialValues={{
          name: user.displayName
        }}
        onSubmit={async ({ name }, { setSubmitting }) => {
          setStatusMessage(null);
          setErrorMessage(null);
          try {
            await firebase.updateProfile({ name })
            setStatusMessage("Changes saved.");
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
                <Typography component="h2" variant="h5" gutterBottom>Your details</Typography>
                <Typography>These details are visible to other users in your projects.</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Field
                  component={TextField}
                  id="name"
                  name="name"
                  label="Name"
                  autoComplete="name"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Save changes
            </Button>
          </Form>
        )}
      </Formik>

      <Divider />

      <Formik
        validationSchema={passwordSchema}
        initialValues={passwordSchema.default()}
        onSubmit={async ({ currentPassword, newPassword }, { setSubmitting }) => {
          setStatusMessage(null);
          setErrorMessage(null);
          try {
            await firebase.changePassword(currentPassword, newPassword)
            setStatusMessage("Your password has been changed.");
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
                <Typography component="h2" variant="h5" gutterBottom>Change password</Typography>
                <Typography>Enter your current password for validation, then your new password, and finally confirm.</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Field
                  component={TextField}
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  label="Current password"
                  autoComplete="current-password"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Field
                  component={TextField}
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  label="Password"
                  autoComplete="new-password"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
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
              variant="contained"
              color="secondary"
              className={classes.submit}
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Change password
            </Button>
          </Form>
        )}
      </Formik>

    </AuthenticatedLayout>
  );


}