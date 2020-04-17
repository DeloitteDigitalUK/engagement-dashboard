import React from 'react';

import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import ProjectForm from '../../components/ProjectForm';
import { Project } from 'models';

const knownErrors = {
  
}

export default function NewProjectPage({ user }) {

  return (
    <AuthenticatedLayout user={user}>

      <ProjectForm
        project={new Project()}
        title="Create project"
        description="Create a new project and share it with others"
        buttonLabel="Create"
        action={async (data) => {
          console.log(data);
        }}
        knownErrors={knownErrors}
        />

    </AuthenticatedLayout>
  );

}