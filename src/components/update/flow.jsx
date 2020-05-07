import React, { useRef, useEffect } from 'react';
import moment from 'moment';
import * as Yup from 'yup';

import { Grid, FormHelperText, FormControl, FormLabel, Typography, Box } from '@material-ui/core';
import { Formik, Form, ErrorMessage, Field } from 'formik';

import Chart from "react-apexcharts";
import jexcel from 'jexcel';

import { UpdateTypes, FlowUpdate } from 'models';

import { submitHandler } from '../../utils/formHelpers';
import * as flow from '../../utils/flowData';

import {
  UpdateSummary,
  UpdateHeader,
  UpdateFields,
  UpdateButtons,
  toInitialValues,
  toUpdateValues,
  useStyles
} from './updateHelpers';

import "../../../node_modules/jexcel/dist/jexcel.css";

// pretty charts

const defaultChartOptions = {
  legend: {
    position: 'bottom',
    itemMargin: {
      vertical: 20
    }
  },
  xaxis: {
    type: 'datetime',
    lines: {
      show: true,
    },
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MMM \'yy',
        day: 'dd MMM',
        hour: 'HH:mm'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: v => Number.parseFloat(v).toFixed()
    },
  },
  dataLabels: {
    enabled: true,
    formatter: v => Number.parseFloat(v).toFixed()
  },
  tooltip: {
    y: {
      formatter: v => Number.parseFloat(v).toFixed(1)
    }
  }
};

const smallChartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    animations: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
};

function FlowSummary({ update }) {

  const itemTypes = update.cycleTimeData.reduce((acc, v) => acc.set(v.itemType, {}), new Map());

  itemTypes.forEach((v, k) => {
    v.cycleTimes = flow.cycleTimes(update.cycleTimeData, k);
    v.averageCycleTimes = flow.averageCycleTimes(v.cycleTimes);
    v.throughput = flow.throughput(v.cycleTimes);
    v.wip = flow.wip(update.cycleTimeData, k);
  });

  return (<>
    <UpdateSummary update={update} />

    <Grid container spacing={2}>

      <Grid item xs={12} md={6}>
        <Chart
          options={{
            ...defaultChartOptions,
            ...smallChartOptions,
            theme: {
              palette: 'palette1'
            },
            title: {
              text: "Average cycle time",
              align: 'center'
            }
          }}
          series={Array.from(itemTypes).map(([key, data]) => ({
            name: key? key : "(Default)",
            data: data.averageCycleTimes.map(({period, averageCycleTime}) => [period.getTime(), averageCycleTime])
          }))}
          type="line"
          />
      </Grid>

      <Grid item xs={12} md={6}>
        <Chart
          options={{
            ...defaultChartOptions,
            ...smallChartOptions,
            theme: {
              palette: 'palette2'
            },
            title: {
              text: "Throughput",
              align: 'center'
            }
          }}
          series={Array.from(itemTypes).map(([key, data]) => ({
            name: key? key : "(Default)",
            data: data.throughput.map(({period, throughput}) => [period.getTime(), throughput])
          }))}
          type="line"
          />
      </Grid>

    </Grid>

    

  </>);
}

function FlowView({ update }) {

  const itemTypes = update.cycleTimeData.reduce((acc, v) => acc.set(v.itemType, {}), new Map());

  itemTypes.forEach((v, k) => {
    v.cycleTimes = flow.cycleTimes(update.cycleTimeData, k);
    v.averageCycleTimes = flow.averageCycleTimes(v.cycleTimes);
    v.throughput = flow.throughput(v.cycleTimes);
    v.wip = flow.wip(update.cycleTimeData, k);
  });

  return (<>
    <UpdateHeader update={update} />

    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Typography color="textPrimary" component="h3" variant="h6" gutterBottom>
          Average cycle times
        </Typography>
        <Typography variant="body1" paragraph>
          In days, by date completed.
        </Typography>
        <Chart
          options={{
            ...defaultChartOptions,
            theme: {
              palette: 'palette1',
            }
          }}
          series={Array.from(itemTypes).map(([key, data]) => ({
            name: key? key : "(Default)",
            data: data.averageCycleTimes.map(({period, averageCycleTime}) => [period.getTime(), averageCycleTime])
          }))}
          type="line"
          />
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography color="textPrimary" component="h3" variant="h6" gutterBottom>
          Weekly throughput
        </Typography>
        <Typography variant="body1" paragraph>
          In items per week, by date completed.
        </Typography>
        <Chart
          options={{
            ...defaultChartOptions,
            theme: {
              palette: 'palette2',
            }
          }}
          series={Array.from(itemTypes).map(([key, data]) => ({
            name: key? key : "(Default)",
            data: data.throughput.map(({period, throughput}) => [period.getTime(), throughput])
          }))}
          type="line"
          />
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography color="textPrimary" component="h3" variant="h6" gutterBottom>
          WIP
        </Typography>
        <Typography variant="body1" paragraph>
          Items not finished per week.
        </Typography>
        <Chart
          options={{
            ...defaultChartOptions,
            theme: {
              palette: 'palette3',
            }
          }}
          series={Array.from(itemTypes).map(([key, data]) => ({
            name: key? key : "(Default)",
            data: data.wip.slice(-12).map(({period, wip}) => [period.getTime(), wip])
          }))}
          type="line"
          />
      </Grid>
    </Grid>
  </>);
}

// helpers for jExcel table component (oh the joys of integrating a DOM-based lirary with React...)

const displayDateFormat = "DD/MM/YYYY";
const parseDateFormats = [
  displayDateFormat,
  "YYYY-MM-DD"
];

export function toStringCell(val) {
  return val === null? "" : val;
}

export function fromStringCell(val) {
  // handling of \0 is a workaround for https://github.com/paulhodel/jexcel/issues/948
  return val === "" || val === "\0"? null : val;
}

export function toDateCell(val) {
  return val instanceof Date? moment(val).format(displayDateFormat) : "";
}

export function fromDateCell(val) {
  // handling of \0 is a workaround for https://github.com/paulhodel/jexcel/issues/948
  if(!val || val === "\0") {
    return null;
  }

  const parsed = moment(val, parseDateFormats);
  return parsed.isValid()? parsed.toDate() : null;
}

function ctFieldValidator(fieldName) {
  const field = Yup.reach(FlowUpdate.getSchema(), `cycleTimeData[].${fieldName}`)
  return (value) => {
    return field.validateSync(value);
  }
}

export function itemToRow(columns, item) {
  return columns.map(col => col.toCell(item[col.name]));
}

export function coerceValue(col, value) {
  const { validate, fromCell, toCell } = col;
  
  let coerced = fromCell(value);

  if(validate) {
    try {
      coerced = validate(coerced);
    } catch(e) {
      // validation errors are ok
    }
  }
      
  return toCell(coerced);
}

function validateRow(jexcel, row, classes) {
  const rowData = jexcel.getRowData(row);
  for(const [col, columnDefinition] of tableColumns.entries()) {
    const { validate, fromCell } = columnDefinition;
    const value = fromCell(rowData[col]);

    if(validate) {
      try {
        validate(value);
        jexcel.getCell([col, row]).classList.remove(classes.invalidCell);
      } catch(e) {
        jexcel.getCell([col, row]).classList.add(classes.invalidCell);
      }
    }
  }
}

export function saveTableData(data, columns, form, field) {
  form.setFieldValue(field.name, 
    data.map(row => row.reduce(
        (prev, cur, idx) => ({...prev, [columns[idx].name]: columns[idx].fromCell(cur) || null}),
        {}
      )
    )
  );
}

// table definition

const tableColumns = [
  // we could use the `calendar` type but it's annoying to have to use the mouse to select each date
  { type: 'text', width: '140px', title: 'Commitment date', name: 'commitmentDate', validate: ctFieldValidator('commitmentDate'), toCell: toDateCell,   fromCell: fromDateCell },
  { type: 'text', width: '140px', title: 'Completion date', name: 'completionDate', validate: ctFieldValidator('completionDate'), toCell: toDateCell,   fromCell: fromDateCell },
  { type: 'text', width: '140px', title: 'Item key',        name: 'item',           validate: ctFieldValidator('item'),           toCell: toStringCell, fromCell: fromStringCell },
  { type: 'text', width: '140px', title: 'Item type',       name: 'itemType',       validate: ctFieldValidator('itemType'),       toCell: toStringCell, fromCell: fromStringCell },
  { type: 'text', width: '140px', title: 'Link',            name: 'url',            validate: ctFieldValidator('url'),            toCell: toStringCell, fromCell: fromStringCell },
];

function InputSpreadsheet({ field, form }) {

  const classes = useStyles();
  const tableRef = useRef(null);

  useEffect(() => {
    const tableOptions = {
      data: field.value.map(v => itemToRow(tableColumns, v)),
      columns: tableColumns,
      minDimensions: [tableColumns.length, 1],
      allowInsertColumn: false,
      parseFormulas: false,
      about: false,
      onbeforechange: function(instance, cell, x, y, value) {
        return coerceValue(instance.jexcel.options.columns[x], value);
      },
      onchange: function(instance, cell, x, y, value) {
        validateRow(instance.jexcel, y, classes);
        return value;
      },
      onafterchanges: function(instance, records) {
        saveTableData(instance.jexcel.getData(), instance.jexcel.options.columns, form, field);
      },
      onbeforedeleterow: function(instance, row, number) {
        // don't permit deleting all rows (workaround for https://github.com/paulhodel/jexcel/issues/947)
        return number !== instance.jexcel.rows.length;
      },
      ondeleterow: function(instance) {
        saveTableData(instance.jexcel.getData(), instance.jexcel.options.columns, form, field);
      },
    };
    
    const ss = jexcel(tableRef.current, tableOptions);
    return () => ss.destroy();
  
  // delberately don't re-run this effect on re-render - we handle "state"
  // imperatively using the Formik API :-/
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.name]);

  return (
    <div ref={tableRef} />
  );

}

// form

function FlowForm({ user, project, update, save, cancel, setMessages, knownErrors }) {
  const classes = useStyles();
  
  const editing = !!update;

  if(!editing) {
    update = new FlowUpdate(null, {
      date: new Date(),
    }, project);
  }
  
  return (
      <Formik
          validationSchema={FlowUpdate.getSchema()}
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
              
              <Grid item xs={8}>
                <FormControl className={classes.lightField}>
                  <FormLabel>Work items</FormLabel>
                  <Box marginTop={1}>
                    <Typography variant="body2" paragraph>
                      Record the commitment (start) and completion (end) dates
                      for relevant work items below. Commitment date and a key
                      work item key (e.g. a name or reference) are required.
                      Work item type and a link to more details are optional.
                      You may also paste data from a spreadsheet. Please enter
                      dates in "DD/MM/YYYY" or "YYYY-MM-DD" format.
                    </Typography>
                  </Box>
                  <Field
                    name="cycleTimeData"
                    component={InputSpreadsheet}
                    />
                
                  {typeof errors.cycleTimeData === 'string' &&
                    <FormHelperText variant="outlined" error><ErrorMessage name="cycleTimeData" /></FormHelperText>
                  }
                </FormControl>
              </Grid>

              <UpdateButtons editing={editing} isSubmitting={isSubmitting} cancel={cancel} />

            </Grid>
          </Form>
        )}
      </Formik>
  );
}

export default {
  updateType: UpdateTypes.flow,
  title: "team flow",
  SummaryView: FlowSummary,
  FullView: FlowView,
  AddForm: FlowForm,
  EditForm: FlowForm,
};
