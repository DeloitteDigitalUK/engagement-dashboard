import React from 'react';

import { useHistory } from 'react-router-dom';

import ProjectForm from '../../components/ProjectForm';
import { useFirebase } from '../../firebase';

const knownErrors = {}

export default function EditProjectPage({ project }) {

  const history = useHistory();
  const firebase = useFirebase();

  return (
    <ProjectForm
      project={project}
      title="Edit project"
      description="Change the settings for your project"
      buttonLabel="Save"
      action={async (data) => {
        project.update(data);
        await firebase.saveProject(project);
        history.push(`/project/${project.getId()}`);
      }}
      knownErrors={knownErrors}
      />
  );

}