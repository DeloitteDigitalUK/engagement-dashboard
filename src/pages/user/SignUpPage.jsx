import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from "react-router-dom";

import { Box, Button, Link, Grid } from '@material-ui/core';
import { Alert } from "@material-ui/lab";
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import AnonymousLayout, { useAnonymousStyles } from '../../layouts/AnonymousLayout';
import { useAPI } from '../../api';

const formSchema = Yup.object({
  name: Yup.string().label("Name").required("Name is required").default(""),
  email: Yup.string().label("Email address").email("Invalid email address").required("Email is required").default(""),
  password: Yup.string().label("Password").min(8, "Password must contain at least 8 characters").required("Password is required").default(""),
  confirmPassword: Yup.string().label("Password confirmation").required("Please confirm your password").oneOf([Yup.ref("password")], "Passwords do not match").default("")
});

const knownErrors = {
  "auth/email-already-in-use": "You already have an account.",
  "auth/weak-password": "Your password is too simple. Please pick a longer/more complex password."
};

export default function SignUpPage() {

  const classes = useAnonymousStyles();
  const api = useAPI();
  const history = useHistory();

  const [ errorMessage, setErrorMessage ] = useState(null);

  return (
    <AnonymousLayout icon={<LockOutlinedIcon />} title="Sign up">
      <Formik
        validationSchema={formSchema}
        initialValues={formSchema.default()}
        onSubmit={async ({ name, email, password }, { setSubmitting }) => {
          try {
            await api.signUp(name, email, password);
            history.push('/');
          } catch(error) {
            if(error.code in knownErrors) {
              setErrorMessage(knownErrors[error.code]);
            } else {
              console.error(error);
              setErrorMessage(error.message);
            }
            setSubmitting(false);
          }
        }}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form className={classes.form} onSubmit={handleSubmit} noValidate>
            
            <Box my={2}>
              {errorMessage && <Alert className={classes.alert} severity="error">{errorMessage}</Alert>}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
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
            >
              Sign up
            </Button>
            
            <Grid container justify="flex-end">
              <Grid item>
                <Link variant="body2" to="/login" component={RouterLink}>
                  Log in instead
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </AnonymousLayout>
  );

}