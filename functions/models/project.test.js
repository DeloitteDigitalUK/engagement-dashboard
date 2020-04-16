const Yup = require('yup');

const Project = require('./project');
const UpdateTypes = require('./updateTypes');
const Roles = require('./roles');

test('can construct an empty object', () => {
  const p = new Project();

  expect(p.getId()).toEqual(null);
  expect(p.toObject()).toEqual({
    owner: "",
    name: "",
    description: "",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {}
  });
});

test('can construct a valid object', () => {
  const p = new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(p.toObject()).toEqual({
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });
});

test('requires an owner', () => {
  expect(() => new Project(null, {
    owner: null,
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).toThrow(Yup.ValidationError);
});

test('requires a name', () => {
  const p = new Project(null, {
    owner: "abcdefg",
    // name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });
  
  expect(p.isValid()).toEqual(false)
});

test('does not require a description', () => {
  const p = new Project(null, {
    owner: "abcdefg",
    name: "A project",
    // description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(p.toObject()).toEqual({
    owner: "abcdefg",
    name: "A project",
    description: "",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });
});

test('update types can be empty', () => {
  expect(() => new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).not.toThrow();
});

test('update types can only contain known types', () => {
  expect(() => new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, "foobar"],
    roles: {
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).toThrow(Yup.ValidationError);
});

test('roles can be empty', () => {
  expect(() => new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {}
  })).not.toThrow();
});

test('roles can be omitted', () => {
  const p = new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    
  });

  expect(p.toObject()).toEqual({
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.releases],
    roles: {}
  });
});

test('role keys must be email addresses', () => {
  expect(() => new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {
      'test@example.org': Roles.administrator,
      'foo': Roles.administrator
    }
  })).toThrow(Yup.ValidationError);
});

test('role values must contain known roles', () => {
  expect(() => new Project(null, {
    owner: "abcdefg",
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {
      'test@example.org': Roles.administrator,
      'test2@example.org': 'foo'
    }
  })).toThrow(Yup.ValidationError);
});
