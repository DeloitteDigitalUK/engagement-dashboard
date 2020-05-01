import React from 'react';
import moment from 'moment';
import MomentUtils from '@date-io/moment';

import { Grid, FormControl, MenuItem, InputLabel, Button, makeStyles, Typography, Chip } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import { Field } from 'formik';

import { TextField, Select } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers'

import { nullToString, stringToNull } from '../../utils/formHelpers';

export const useStyles = makeStyles((theme) => ({
  cancelButton: {
    marginLeft: theme.spacing(1)
  },
  lightField: {
    marginLeft: theme.spacing(0.5)
  },
  teamLabel: {
    marginLeft: theme.spacing(2),
    verticalAlign: 'top'
  },
  content: {
    ...theme.typography.body1
  }
}));

/**
 * Return an object suitable to use as initial values for Formik
 */
export function toInitialValues(update) {
  return {
    ...update.toObject(),
    date: update.date? update.date : new Date(),
    team: nullToString(update.team)
  };
}

/**
 * Convert form values to data suitable for an update
 */
export function toUpdateValues(data) {
  return {
    ...data,
    team: stringToNull(data.team)
  };
}

/**
 * Common summary view elements for updates
 */
export function UpdateSummary({ update }) {
  
  const classes = useStyles();

  return (
    <>
      <Typography color="textPrimary" component="h2" variant="h5" gutterBottom>
        {update.title}
        {update.team && <Chip color="primary" variant="outlined" label={update.team} className={classes.teamLabel} size="small" />}
      </Typography>
      <Typography color="textSecondary" paragraph>{update.summary}</Typography>
    </>
  );
}

/**
 * Common full view elements for updates
 */
export function UpdateHeader({ update }) {

  const classes = useStyles();

  return (
    <Grid container>
      <Grid item xs={10} md={10}>
        <Typography component="h2" variant="h3" gutterBottom>
          {update.title}
          {update.team && <Chip color="primary" variant="outlined" label={update.team} className={classes.teamLabel} size="small" />}
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Typography variant="subtitle2">{update.authorName? `By ${update.authorName} on ` : ""}{moment(update.date).format("DD MMM YYYY")}</Typography>
        <Typography paragraph>{update.summary}</Typography>
      </Grid>
    </Grid>
  );
}

/**
 * Common form fields for updates
 */
export function UpdateFields({ project }) {

  const classes = useStyles();

  return (<>
    
    <Grid item xs={12} md={3}>
        <Field
          component={TextField}
          id="title"
          name="title"
          label="Tile"
          variant="outlined"
          fullWidth
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Field
          component={TextField}
          id="summary"
          name="summary"
          label="Summary"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          rowsMax={8}
        />
      </Grid>

      <Grid item xs={12} md={2}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Field
            className={classes.lightField}
            component={KeyboardDatePicker}
            id="date"
            name="date"
            label="Date"
            disableToolbar
            fullWidth
            variant="inline"
            format="DD/MM/YYYY"
            />
        </MuiPickersUtilsProvider>
      </Grid>

      {project.teams && project.teams.length > 0 && (
        <Grid item xs={12} md={2}>
          <FormControl fullWidth className={classes.lightField}>
            <InputLabel htmlFor="team">Team</InputLabel>
            <Field
              component={Select}
              id="team"
              name="team"
            >
              <MenuItem value="(null)">(none)</MenuItem>
              {project.teams.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Field>
          </FormControl>
        </Grid>
      )}
  </>);
}

export function UpdateButtons({editing, isSubmitting, cancel}) {

  const classes = useStyles();

  return (
    <Grid item xs={12} md={4}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
      >
        {editing? "Save" : "Create"}
      </Button>
      <Button
        type="button"
        variant="text"
        color="inherit"
        disabled={isSubmitting}
        underlined="always"
        className={classes.cancelButton}
        onClick={cancel}
      >
        Cancel
      </Button>
    </Grid>
  );
}