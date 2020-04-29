import React from 'react';

import pick from 'lodash.pick';
import invert from 'lodash.invert';
import fromPairs from 'lodash.frompairs';

import { useHistory } from 'react-router-dom';

import { Button, Grid, FormControl, FormLabel, Typography, Paper, makeStyles } from '@material-ui/core';

import * as Yup from "yup";
import { Formik, Form, Field } from 'formik';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';

import StatusMessages from './StatusMessages';
import FormDescription from './FormDescription';

import { useStatusMessages, submitHandler, isListOfEmails, splitLines } from '../utils/formHelpers';

import { Project, Roles, UpdateTypes } from 'models';

const formSchema = Yup.object({
  name: Yup.string().label("Name").required().default(""),
  description: Yup.string().label("Description").default(""),

  enableGoals: Yup.bool().required().default(true),
  enableInsights: Yup.bool().required().default(true),
  enableReleases: Yup.bool().required().default(true),
  enableRaid: Yup.bool().required().default(true),
  enableFlow: Yup.bool().required().default(false),

  teams: Yup.string().label("Teams").trim().default(""),

  administrators: Yup.string().label("Administrators").trim().test(isListOfEmails).default(""),
  authors: Yup.string().label("Authors").trim().test(isListOfEmails).default(""),
  members: Yup.string().label("Team members").trim().test(isListOfEmails).default(""),
});

// map individual checkbox values from the form schema to members of the array on the project schema
const propsToUpdateTypes = {
    enableGoals: UpdateTypes.goals,
    enableInsights: UpdateTypes.insights,
    enableReleases: UpdateTypes.release,
    enableRaid: UpdateTypes.raid,
    enableFlow: UpdateTypes.flow
  },
  updateTypesToProps = invert(propsToUpdateTypes);

export function projectToFormData(project) {
  let form = formSchema.default();

  // copy over fields where names match
  Object.assign(form, pick(project, Object.keys(formSchema.fields)));
  
  // list -> checkboxes
  for(let prop in propsToUpdateTypes) {
    form[prop] = project.updateTypes.includes(propsToUpdateTypes[prop]);
  }

  // teams list -> string
  form.teams = (project.teams || []).join('\n');

  // role map -> strings
  form.administrators = Object.keys(project.roles).filter(v => project.roles[v] === Roles.administrator).sort().join('\n');
  form.authors = Object.keys(project.roles).filter(v => project.roles[v] === Roles.author).sort().join('\n');
  form.members = Object.keys(project.roles).filter(v => project.roles[v] === Roles.member).sort().join('\n');

  return form;
}

export function formDataToProjectData(project, form) {
  let data = {};

  // copy over fields where names match
  Object.assign(data, pick(form, Object.keys(Project.getSchema().fields)));
  
  // checkboxes -> list
  data.updateTypes = Object.values(UpdateTypes).filter(v => form[updateTypesToProps[v]]);

  // strings -> teams list
  data.teams = form.teams.trim()? form.teams.split(splitLines).map(v => v.trim()) : [];

  // strings -> role map (note: order matters in case a user is listed in more than one!)
  data.roles = fromPairs([].concat(
    form.members.split(splitLines).map(v => v.trim()).filter(v => !!v).map(v => [v, Roles.member]),
    form.authors.split(splitLines).map(v => v.trim()).filter(v => !!v).map(v => [v, Roles.author]),
    form.administrators.split(splitLines).map(v => v.trim()).filter(v => !!v).map(v => [v, Roles.administrator]),
    Object.entries(project.roles).filter(([k, v]) => v === Roles.owner),
  ));
  
  return data;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1, 2, 2, 2)
  },
  cancelButton: {
    marginLeft: theme.spacing(1)
  }
}));

/**
 * Generic add/edit form for projects, which operate on a `Project` model
 * instance and call `action()`.
 */
export default function ProjectForm({
  project,
  title,
  description,
  buttonLabel,
  action,
  knownErrors
}) {

  const history = useHistory();
  const classes = useStyles();

  const [ messages, setMessages ] = useStatusMessages();


  return (
    <Paper className={classes.paper}>
      <StatusMessages messages={messages} />

      <FormDescription title={title}>
        {description}
      </FormDescription>

      <Formik
        validationSchema={formSchema}
        initialValues={projectToFormData(project)}
        onSubmit={submitHandler({
          action: (data) => action(formDataToProjectData(project, data)),
          knownErrors,
          setMessages,
        })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
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
                <Field
                    component={TextField}
                    id="teams"
                    name="teams"
                    label="Teams"
                    placeholder="List of teams, one per line"
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
                  <Grid container>
                    <Grid item xs={12} md={6}>
                      <Field
                        component={CheckboxWithLabel}
                        Label={{ label: "Goals" }}
                        type="checkbox"
                        id="enableGoals"
                        name="enableGoals"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        component={CheckboxWithLabel}
                        Label={{ label: "Insights" }}
                        type="checkbox"
                        id="enableInsights"
                        name="enableInsights"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        component={CheckboxWithLabel}
                        Label={{ label: "Releases" }}
                        type="checkbox"
                        id="enableReleases"
                        name="enableReleases"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        component={CheckboxWithLabel}
                        Label={{ label: "RAID items" }}
                        type="checkbox"
                        id="enableRaid"
                        name="enableRaid"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        component={CheckboxWithLabel}
                        Label={{ label: "Flow metrics" }}
                        type="checkbox"
                        id="enableFlow"
                        name="enableFlow"
                      />
                    </Grid>
                  </Grid>
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
                >
                  {buttonLabel}
                </Button>
                <Button
                  type="button"
                  variant="text"
                  color="inherit"
                  disabled={isSubmitting}
                  underlined="always"
                  className={classes.cancelButton}
                  onClick={e => {
                    e.preventDefault();
                    history.goBack();
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );

}