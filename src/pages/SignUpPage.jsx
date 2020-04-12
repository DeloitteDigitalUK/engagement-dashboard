import React, { useState } from 'react';

import { Avatar, Button, Link, Grid, Typography, Paper } from '@material-ui/core';
import { Alert } from "@material-ui/lab";
import { makeStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout from '../layouts/AnonymousLayout';
import { useFirebase } from '../firebase';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  error: {
    width: '100%',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignupPage() {

  const classes = useStyles();
  const firebase = useFirebase();

  let [errorMessage, setErrorMessage] = useState(null);

  const signup = async (data) => {
    try {
      const user = await firebase.signUp(data.name, data.email, data.password);
      // TODO: Redirect
      alert("Logged in as " + user.displayName);
    } catch(error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  }

  return (
    <AnonymousLayout>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
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
            await signup(values);
            setSubmitting(false);
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {errorMessage && <Alert className={classes.error} severity="error">{errorMessage}</Alert>}
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
                Sign Up
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
      </Paper>
    </AnonymousLayout>
  );


}

export default SignupPage;