import React, { useRef, useEffect } from 'react';
import * as Yup from 'yup';

import { Grid, FormHelperText, FormControl, FormLabel } from '@material-ui/core';
import { Formik, Form, ErrorMessage, Field } from 'formik';

import jexcel from 'jexcel';

import { UpdateTypes, FlowUpdate } from 'models';

import { submitHandler } from '../../utils/formHelpers';
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
import moment from 'moment';

// helpers for jExcel table component (oh the joys of integrating a DOM-based lirary with React...)

const emptyRow = Yup.reach(FlowUpdate.getSchema(), `cycleTimeData[]`).default()

function ctFieldValidator(fieldName) {
  const field = Yup.reach(FlowUpdate.getSchema(), `cycleTimeData[].${fieldName}`)
  return (value) => {
    return field.validateSync(value);
  }
}

function coerceValue(jexcel, col, value) {
  const validator = jexcel.options.columns[col].validate;

  let coerced = value;
  
  if(coerced === "") {
    coerced = null;
  }
  
  if(validator) {
    try {
      coerced = validator(coerced);
    } catch(e) {
      // validation errors are ok
    }
  }
      
  // this is a bit hacky, but we store the date as a string in a format
  // that we know the schema validator will later cast correctly
  if(coerced instanceof Date) {
    coerced = moment(coerced).format("DD/MM/YYYY");
  }

  return coerced;
}

function validateRow(jexcel, row, classes) {
  const rowData = jexcel.getRowData(row);
  for(const [col, columnDefinition] of tableColumns.entries()) {
    const validator = columnDefinition.validate;
    const value = rowData[col];

    if(validator) {
      try {
        validator(value || null);
        jexcel.getCell([col, row]).classList.remove(classes.invalidCell);
      } catch(e) {
        jexcel.getCell([col, row]).classList.add(classes.invalidCell);
      }
    }
  }
}

function saveTableData(jexcel, form, field) {
  const columns = jexcel.getConfig().columns;
  const data = jexcel.getData().map(row => row.reduce((prev, cur, idx) => ({...prev, [columns[idx].name]: cur || null}), {}));
  form.setFieldValue(field.name, data);
}
function itemToRow(item) {
  return tableColumns.map(col => col.translate(item[col.name]));
}

// table definition

const tableColumns = [
  // we could use the `calendar` type but it's annoying to have to use the mouse to select each date
  { type: 'text', width: '140px', title: 'Commitment date', name: 'commitmentDate', validate: ctFieldValidator('commitmentDate'), translate: val => val instanceof Date? moment(val).format('DD/MM/YYYY') : null },
  { type: 'text', width: '140px', title: 'Completion date', name: 'completionDate', validate: ctFieldValidator('completionDate'), translate: val => val instanceof Date? moment(val).format('DD/MM/YYYY') : null },
  { type: 'text', width: '140px', title: 'Item key',        name: 'item',           validate: ctFieldValidator('item'),           translate: val => val },
  { type: 'text', width: '140px', title: 'Item type',       name: 'itemType',       validate: ctFieldValidator('itemType'),       translate: val => val },
  { type: 'text', width: '140px', title: 'Link',            name: 'url',            validate: ctFieldValidator('url'),            translate: val => val },
];


function FlowSummary({ update }) {
  return <UpdateSummary update={update} />;
}

function FlowView({ update }) {
  return (<>
    <UpdateHeader update={update} />
  </>);
}

function InputSpreadsheet({ field, form }) {

  const classes = useStyles();
  const tableRef = useRef(null);

  useEffect(() => {
    const tableData = field.value.map(itemToRow);

    if(tableData.length === 0) {
      tableData.push(itemToRow(emptyRow));
    }

    const tableOptions = {
      data: tableData,
      columns: tableColumns,
      allowInsertColumn: false,
      parseFormulas: false,
      about: false,
      onbeforechange: function(instance, cell, x, y, value) {
        return coerceValue(instance.jexcel, x, value);
      },
      onchange: function(instance, cell, x, y, value) {
        validateRow(instance.jexcel, y, classes);
        return value;
      },
      onafterchanges: function(instance, records) {
        saveTableData(instance.jexcel, form, field);
      },
      onbeforedeleterow: function(instance, row, number) {
        // don't permit deleting all rows (workaround for https://github.com/paulhodel/jexcel/issues/947)
        return number !== instance.jexcel.rows.length;
      },
      ondeleterow: function(instance) {
        saveTableData(instance.jexcel, form, field);
      },
      onbeforepaste: function(instance, data, x, y) {
        // if the last cell is empty, we get a weird null value (see )
        if(data && data[data.length-1] === "\t") {
          data = data.slice(0, data.length-1);
        }
        return data;
      },
      onpaste: function(instance, data, x, y) {
        // debugger
      }
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
                  <FormHelperText variant="standard">
                    Record the commitment (start) and completion (end) dates
                    for relevant work items below. Commitment date and key
                    (e.g. name or reference) are required. Work item type
                    and a link to more details are optional. You may also paste
                    data from a spreadsheet.
                  </FormHelperText>
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
