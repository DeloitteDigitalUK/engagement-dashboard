import React from 'react';

import { useHistory } from 'react-router-dom';

import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import ProjectForm from '../../components/ProjectForm';
import { Project } from 'models';
import { useFirebase } from '../../firebase';

const knownErrors = {}

export default function NewProjectPage({ user }) {

  const history = useHistory();
  const firebase = useFirebase();
  const project = new Project();

  return (
    <AuthenticatedLayout user={user}>

      <ProjectForm
        project={project}
        title="Create project"
        description="Create a new project and share it with others"
        buttonLabel="Create"
        action={async (data) => {
          project.update(data);
          await firebase.addProject(user, project);
          history.push(`/project/${project.getId()}`);
        }}
        knownErrors={knownErrors}
        />

    </AuthenticatedLayout>
  );

}