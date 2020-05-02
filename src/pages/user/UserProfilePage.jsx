import React from 'react';

import { Button, Grid, Divider, makeStyles } from '@material-ui/core';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import { useAPI } from '../../api';

import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';

import StatusMessages from '../../components/StatusMessages';
import FormDescription from '../../components/FormDescription';

import { useStatusMessages, submitHandler } from '../../utils/formHelpers';

const profileSchema = Yup.object({
  name: Yup.string().label("Name").required().default(""),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().label("Current password").required().default(""),
  newPassword: Yup.string().label("New password").min(8).required("New password is required").default(""),
  confirmPassword: Yup.string().label("Password confirmation").required().oneOf([Yup.ref("newPassword")], "Passwords do not match").default("")
});

const knownErrors = {
  'auth/wrong-password': "Your current password is incorrect.",
  'auth/weak-password': "Your new password is too simple. Please pick a longer/more complex password."
}

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(3, 0)
  }
}));

export default function UserProfilePage({ user }) {

  const classes = useStyles();
  const api = useAPI();

  const [ messages, setMessages ] = useStatusMessages();

  return (
    <AuthenticatedLayout user={user}>

      <StatusMessages messages={messages} />

      <FormDescription title="Your details">
        These details are visible to other users in your projects.
      </FormDescription>

      <Formik
        validationSchema={profileSchema}
        initialValues={{ ...profileSchema.default(), name: user.displayName }}
        onSubmit={submitHandler({
          action: async ({ name }) => await api.updateProfile({ name }),
          success: "Changes saved",
          knownErrors,
          setMessages,
        })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} direction="column">
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
              <Grid item xs={12} md={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Save changes
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      <Divider className={classes.divider} />

      <FormDescription title="Change password">
        Enter your current password for validation, then your new password, and finally confirm.
      </FormDescription>

      <Formik
        validationSchema={passwordSchema}
        initialValues={passwordSchema.default()}
        onSubmit={submitHandler({
          action: async ({ currentPassword, newPassword }) => await api.changePassword(currentPassword, newPassword),
          success: "Your password has been changed",
          knownErrors,
          setMessages
        })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>

            <Grid container spacing={2} direction="column">
              <Grid item xs={12} md={4}>
                <Field
                  component={TextField}
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  label="Current password"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Field
                  component={TextField}
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isSubmitting}
                >
                  Change password
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

    </AuthenticatedLayout>
  );


}