import React from 'react';

import { useHistory } from 'react-router-dom';

import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import ProjectForm from '../../components/ProjectForm';

import { Project, Roles } from 'models';

import { useAPI } from '../../api';

const knownErrors = {}

export default function NewProjectPage({ user }) {

  const history = useHistory();
  const api = useAPI();
  const project = new Project(null, {
    roles: {
      [user.email]: Roles.owner
    }
  });

  return (
    <AuthenticatedLayout user={user}>

      <ProjectForm
        project={project}
        title="Create project"
        description="Create a new project and share it with others"
        buttonLabel="Create"
        action={async (data) => {
          project.update(data);
          await api.addProject(user, project);
          history.push(`/project/${project.id}`);
        }}
        knownErrors={knownErrors}
        />

    </AuthenticatedLayout>
  );

}