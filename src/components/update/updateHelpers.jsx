import React from 'react';
import MomentUtils from '@date-io/moment';

import { Grid, FormControl, MenuItem, InputLabel, Button, makeStyles } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import { Field } from 'formik';

import { TextField, Select } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers'

import { nullToString, stringToNull } from '../../utils/formHelpers';

const useStyles = makeStyles((theme) => ({
  cancelButton: {
    marginLeft: theme.spacing(1)
  }
}));

/**
 * Return an object suitable to use as initial values for Formik
 */
export function toInitialValues(update) {
  return {
    ...update.toObject(),
    date: new Date(),
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
 * Common form fields for updates
 */
export function UpdateFields({project}) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
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

      <Grid item xs={12} md={6}>
        <Field
          component={KeyboardDatePicker}
          id="date"
          name="date"
          label="Date"
          disableToolbar
          variant="inline"
          format="DD/MM/YYYY"
        />
      </Grid>

      {project.teams && project.teams.length > 0 && (
        <Grid item xs={12} md={6}>
          <FormControl>
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
    </MuiPickersUtilsProvider>
  );
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