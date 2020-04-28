import React, { useState } from 'react';

import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';

import { makeStyles } from '@material-ui/core';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const useStyles = makeStyles((theme) => ({
  editor: {
    padding: theme.spacing(0, 1),
    border: `solid ${theme.palette.divider} 1px`
  },
  toolbar: {
    border: 'none',
    padding: theme.spacing(1, 0, 0, 0)
  }
}));

export default function WysiwygEditor({
  field,
  form,
}) {

  const initialValue = EditorState.createWithContent(convertFromRaw(markdownToDraft(field.value)));
  
  const [ editorState, setEditorState ] = useState(initialValue);
  const classes = useStyles();
  
  function onEditorStateChange(newState) {
    setEditorState(newState);

    const markdown = draftToMarkdown(convertToRaw(newState.getCurrentContent()));
    form.setFieldTouched(field.name, true);
    form.setFieldValue(field.name, markdown);
  }

  return (
    <>
      <Editor
        editorClassName={classes.editor}
        toolbarClassName={classes.toolbar}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'link', 'image', 'remove', 'history'],
          inline: {
            options: ['bold', 'italic', 'strikethrough'],
          }
        }}
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
      />
    </>
  );

}

