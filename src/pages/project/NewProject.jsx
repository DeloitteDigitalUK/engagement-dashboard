import React from 'react';

import { Button, Grid, FormControl, FormLabel, Typography } from '@material-ui/core';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';

import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';

import StatusMessages from '../../components/StatusMessages';
import FormDescription from '../../components/FormDescription';

import { useStatusMessages, submitHandler } from '../../utils/formHelpers';

const validateEmail = Yup.string().email().required();
const listOfEmails = {
  name: 'is-list-of-email-addresses',
  message: 'Please enter a list of email addresses, one per line',
  test: value => !value || value.split(/[\r\n,;]/).every(v => !v || validateEmail.isValidSync(v.trim()))
};

const formSchema = Yup.object({
  name: Yup.string().label("Name").required().default(""),
  description: Yup.string().label("Description").default(""),

  enableInsights: Yup.bool().required().default(true),
  enableReleases: Yup.bool().required().default(true),

  administrators: Yup.string().label("Administrators").trim().test(listOfEmails).default(""),
  authors: Yup.string().label("Authors").trim().test(listOfEmails).default(""),
  members: Yup.string().label("Team members").trim().test(listOfEmails).default(""),
});

const knownErrors = {
  
}

export default function NewProjectPage({ user }) {

  const [ messages, setMessages ] = useStatusMessages();

  return (
    <AuthenticatedLayout user={user}>

      <StatusMessages messages={messages} />

      <FormDescription title="New project">
        Create a new project and share it with others.
      </FormDescription>

      <Formik
        validationSchema={formSchema}
        initialValues={{
          ...formSchema.default()
        }}
        onSubmit={submitHandler({
          action: () => {
            // TODO: Create, redirect
          },
          knownErrors,
          setMessages,
        })}
      >
        {({ submitForm, isSubmitting }) => (
          <Form noValidate>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12} md={3}>
                <Field
                  component={TextField}
                  id="name"
                  name="name"
                  label="Name"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  component={TextField}
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  rowsMax={8}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                <FormLabel component="legend">Enabled update types</FormLabel>
                  <Field
                    component={CheckboxWithLabel}
                    Label={{ label: "Insights" }}
                    type="checkbox"
                    id="enableInsights"
                    name="enableInsights"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    Label={{ label: "Releases" }}
                    type="checkbox"
                    id="enableReleases"
                    name="enableReleases"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormLabel>Roles</FormLabel>
                <Typography variant="body2" paragraph>
                  To allow other users to access this project, enter their email addresses,
                  one per line. Administrators can modify project settings. Authors can
                  add and modify updates. Members can only view updates. There is no need
                  to add the same user to more than one list.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  component={TextField}
                  id="administrators"
                  name="administrators"
                  label="Administrators"
                  placeholder="List of email addresses, one per line"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  rowsMax={8}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  component={TextField}
                  id="authors"
                  name="authors"
                  label="Authors"
                  placeholder="List of email addresses, one per line"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  rowsMax={8}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  component={TextField}
                  id="members"
                  name="members"
                  label="Members"
                  placeholder="List of email addresses, one per line"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  rowsMax={8}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={submitForm}
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

    </AuthenticatedLayout>
  );


}