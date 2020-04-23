import { projectToFormData, formDataToProjectData } from './ProjectForm';
import { Project, Roles, UpdateTypes } from 'models';

describe('projectToForm', () => {

  test('can convert a blank project', () => {
    const p = new Project();
    expect(projectToFormData(p)).toEqual({
      name: "",
      description: "",
      enableInsights: true,
      enableReleases: true,
      administrators: "",
      authors: "",
      members: "",
    });
  });
  
  test('can convert a project with data', () => {
    const p = new Project(null, {
      name: "My project",
      description: "A description for my project",
      updateTypes: [UpdateTypes.insights],
      roles: {
        'test@example.org': Roles.owner,
        'test1@example.org': Roles.administrator,
        'test2@example.org': Roles.author,
        'test3@example.org': Roles.author,
        'test4@example.org': Roles.member,
      }
    });
    expect(projectToFormData(p)).toEqual({
      name: "My project",
      description: "A description for my project",
      enableInsights: true,
      enableReleases: false,
      administrators: "test1@example.org",
      authors: "test2@example.org\ntest3@example.org",
      members: "test4@example.org",
    });
  });

});

describe('formToProject', () => {

  test('can convert a form to a project', () => {

    const project = new Project(null, {
      roles: {
        'test@example.org': Roles.owner,
      }
    })

    const data = {
      name: "My project",
      description: "A description",
      enableInsights: false,
      enableReleases: true,
      administrators: "test11@example.org",
      authors: "test21@example.org\ntest31@example.org",
      members: "test41@example.org",
    };

    expect(formDataToProjectData(project, data)).toEqual({
      name: "My project",
      description: "A description",
      updateTypes: [UpdateTypes.release],
      roles: {
        'test@example.org': Roles.owner,
        'test11@example.org': Roles.administrator,
        'test21@example.org': Roles.author,
        'test31@example.org': Roles.author,
        'test41@example.org': Roles.member,
      }
    });

  });

  test('round trip', () => {

    const project = new Project(null, {
      name: "My project",
      description: "A description for my project",
      updateTypes: [UpdateTypes.insights],
      roles: {
        'test@example.org': Roles.owner,
        'test1@example.org': Roles.administrator,
        'test2@example.org': Roles.author,
        'test3@example.org': Roles.author,
        'test4@example.org': Roles.member,
      }
    });

    const formData = projectToFormData(project),
          projectData = formDataToProjectData(project, formData),
          replacementProject = new Project(null);

    replacementProject.update(projectData);

    expect(replacementProject.toObject()).toEqual({
      name: "My project",
      description: "A description for my project",
      updateTypes: [UpdateTypes.insights],
      roles: {
        'test@example.org': Roles.owner,
        'test1@example.org': Roles.administrator,
        'test2@example.org': Roles.author,
        'test3@example.org': Roles.author,
        'test4@example.org': Roles.member,
      }
    });
    
  });

});
