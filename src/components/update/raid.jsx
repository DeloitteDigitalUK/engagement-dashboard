import React from 'react';
import moment from 'moment';
import MomentUtils from '@date-io/moment';

import { Grid, MenuItem, FormLabel, TableHead, Table, TableCell, TableBody, TableRow, IconButton, Button, FormHelperText, Link } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { Select, TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import ArrowUpwardOutlined from '@material-ui/icons/ArrowUpwardOutlined';
import ArrowDownwardOutlined from '@material-ui/icons/ArrowDownwardOutlined';

import { UpdateTypes, RaidUpdate } from 'models';

import { submitHandler } from '../../utils/formHelpers';
import {
  UpdateSummary,
  UpdateHeader,
  UpdateFields,
  UpdateButtons,
  toInitialValues,
  toUpdateValues,
  useStyles,
} from './updateHelpers';

function capitalizeFirstLetter([ first, ...rest ], locale = navigator.language) {
  return [ first.toLocaleUpperCase(locale), ...rest ].join('');
}

function RaidSummary({ update }) {
  return <UpdateSummary update={update} />;
}

function RaidView({ update }) {
  return (<>
    <UpdateHeader update={update} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>Summary</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {update.raidItems.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              {capitalizeFirstLetter(item.type)}
            </TableCell>
            <TableCell>
              {item.url?
                <Link href={item.url} target="_blank">{item.summary}</Link>
                : item.summary
              }
            </TableCell>
            <TableCell>
              {capitalizeFirstLetter(item.priority)}
            </TableCell>
            <TableCell>
              {item.date?
                moment(item.date).format("DD MMM YYYY")
                : "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>);
}

function RaidForm({ user, project, update, save, cancel, setMessages, knownErrors }) {
  const classes = useStyles();

  const editing = !!update;

  if(!editing) {
    update = new RaidUpdate(null, {
      date: new Date(),
    }, project);
  }

  const blankRow = {
    type: 'risk',
    summary: "",
    url: "",
    priority: 'medium',
    date: null,
  };

  return (
      <Formik
          validationSchema={RaidUpdate.getSchema()}
          initialValues={toInitialValues(update)}
          onSubmit={submitHandler({
            action: async (data) => {
              update.update(toUpdateValues(data));
              await save(update);
            },
            knownErrors,
            setMessages,
          })}
      >
        {({ handleSubmit, isSubmitting, values, errors }) => (
          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} direction="column">

              <UpdateFields project={project} />
              <MuiPickersUtilsProvider utils={MomentUtils}>

                <Grid item xs={12} md={12}>
                  <FormLabel className={classes.lightField}>RAID items</FormLabel>                      
                  <FieldArray name="raidItems">
                    {(arrayHelpers) => <>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{width: "15%"}}>Type</TableCell>
                            <TableCell style={{width: "25%"}}>Summary</TableCell>
                            <TableCell style={{width: "20%"}}>Link</TableCell>
                            <TableCell style={{width: "13%"}}>Priority</TableCell>
                            <TableCell style={{width: "15%"}}>Date</TableCell>
                            <TableCell style={{width: "12%"}}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {values.raidItems.map((item, index) => (
                            <TableRow key={index} className={classes.inputTableRow}>
                              <TableCell>
                                <Field
                                  component={Select}
                                  name={`raidItems.${index}.type`}
                                  fullWidth
                                >
                                  <MenuItem value="risk">Risk</MenuItem>
                                  <MenuItem value="issue">Issue</MenuItem>
                                  <MenuItem value="assumption">Assumption</MenuItem>
                                  <MenuItem value="dependency">Dependency</MenuItem>
                                  <MenuItem value="decision">Decision</MenuItem>
                                </Field>
                              </TableCell>
                              <TableCell>
                                <Field
                                  component={TextField}
                                  name={`raidItems.${index}.summary`}
                                  variant="standard"
                                  size="small"
                                  fullWidth
                                  />
                              </TableCell>
                              <TableCell>
                                <Field
                                  component={TextField}
                                  name={`raidItems.${index}.url`}
                                  variant="standard"
                                  size="small"
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Field
                                  component={Select}
                                  name={`raidItems.${index}.priority`}
                                  fullWidth
                                >
                                  <MenuItem value="low">Low</MenuItem>
                                  <MenuItem value="medium">Medium</MenuItem>
                                  <MenuItem value="high">High</MenuItem>
                                </Field>
                              </TableCell>
                              <TableCell>
                                <Field
                                  component={KeyboardDatePicker}
                                  name={`raidItems.${index}.date`}
                                  disableToolbar
                                  fullWidth
                                  variant="inline"
                                  format="DD/MM/YYYY"
                                  />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  className={classes.tableIconButton}
                                  onClick={() => { arrayHelpers.remove(index); }}
                                >
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  className={classes.tableIconButton}
                                  disabled={index === 0}
                                  onClick={() => { arrayHelpers.move(index, index-1); }}
                                >
                                  <ArrowUpwardOutlined />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  className={classes.tableIconButton}
                                  disabled={index === values.raidItems.length - 1}
                                  onClick={() => { arrayHelpers.move(index, index+1); }}
                                >
                                  <ArrowDownwardOutlined />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button
                        type="button"
                        variant="text"
                        color="primary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => { arrayHelpers.push({...blankRow}); }}
                      >
                        Add item
                      </Button>
                    </>}
                  </FieldArray>
                  {typeof errors.raidItems === 'string' && 
                    <FormHelperText variant="outlined" error><ErrorMessage name="raidItems" /></FormHelperText>
                  }
                </Grid>
              </MuiPickersUtilsProvider>
              
              <UpdateButtons editing={editing} isSubmitting={isSubmitting} cancel={cancel} />

            </Grid>
          </Form>
        )}
      </Formik>
  );
}

export default {
  updateType: UpdateTypes.raid,
  title: "RAID",
  SummaryView: RaidSummary,
  FullView: RaidView,
  AddForm: RaidForm,
  EditForm: RaidForm,
};
