const Yup = require('yup');

const Project = require('./project');
const UpdateTypes = require('./updateTypes');
const Roles = require('./roles');

test('can construct an empty object', () => {
  const p = new Project();

  expect(p.id).toEqual(null);
  expect(p.toObject()).toEqual({
    name: "",
    description: "",
    updateTypes: [UpdateTypes.goals, UpdateTypes.insights, UpdateTypes.release, UpdateTypes.raid],
    teams: [],
    roles: {},
    tokens: []
  });
});

test('can construct a valid object', () => {
  const p = new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    },
    tokens: [{
      uid: '123',
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Test token"
    }]
  });

  expect(p.toObject()).toEqual({
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    },
    tokens: [{
      uid: '123',
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Test token"
    }]
  });
});

test('requires an owner', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    roles: {
      // 'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).toThrow(Yup.ValidationError);
});

test('requires a name', () => {
  const p = new Project(null, {
    // name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });
  
  expect(p.isValid()).toEqual(false)
});

test('does not require a description', () => {
  const p = new Project(null, {
    name: "A project",
    // description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(p.toObject()).toEqual({
    name: "A project",
    description: "",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    teams: [],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    },
    tokens: []
  });
});

test('update types can be empty', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).not.toThrow();
});

test('update types can only contain known types', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, "foobar"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  })).toThrow(Yup.ValidationError);
});

test('roles cannot be empty', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {}
  })).toThrow(Yup.ValidationError);
});

test('role keys must be email addresses', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'foo': Roles.administrator
    }
  })).toThrow(Yup.ValidationError);
});

test('role values must contain known roles', () => {
  expect(() => new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': 'foo'
    }
  })).toThrow(Yup.ValidationError);
});

test('encodes email addresses in firebase keys', () => {
  const p = new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org.uk': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(Project.toFirestore(p)).toEqual({
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    owner: 'test@example@@org',
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example@@org': Roles.owner,
      'test1@example@@org@@uk': Roles.administrator,
      'test2@example@@org': Roles.author,
      'test3@example@@org': Roles.member,
    },
    tokens: []
  });
});

test('decodes email addresses in firebase keys', () => {
  const p = Project.fromFirestore({
    id: '123',
    data: () => ({
      name: "A project",
      description: "My project",
      updateTypes: [UpdateTypes.insights, UpdateTypes.release],
      owner: 'test@example@@org',
      teams: ["Alpha", "Beta"],
      roles: {
        'test@example@@org': Roles.owner,
        'test1@example@@org@@uk': Roles.administrator,
        'test2@example@@org': Roles.author,
        'test3@example@@org': Roles.member,
      }
    })
  });

  expect(p.id).toEqual("123");
  expect(p.toObject()).toEqual({
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org.uk': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    },
    tokens: []
  });

});

test('handles invalid data in database if required', () => {
  // don't show error in test output
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const p = Project.fromFirestore({
    id: '123',
    data: () => ({
      name: "My project", // will fail validation
      description: "My project",
      updateTypes: ["garbage"],
      owner: 'test@example@@org',
      teams: ["Alpha", "Beta"],
      roles: {
        'test@example@@org': Roles.owner,
        'test1@example@@org': Roles.administrator,
        'test2@example@@org': Roles.author,
        'test3@example@@org': Roles.member,
      }
    })
  });
  spy.mockRestore();

  expect(p.id).toEqual("123");
  expect(p.error).toBeTruthy();
  expect(p.toObject()).toEqual({
    name: "My project",
    description: "My project",
    updateTypes: ["garbage"],
    teams: ["Alpha", "Beta"],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    },
    tokens: []
  });

});

test('hasRole() with single role', () => {
  const p = new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(p.hasRole('test@example.org', 'owner')).toEqual(true);
  expect(p.hasRole('test@example.org', 'administrator')).toEqual(false);
  expect(p.hasRole('test99@example.org', 'member')).toEqual(false);
});

test('hasRole() with a list of roles', () => {
  const p = new Project(null, {
    name: "A project",
    description: "My project",
    updateTypes: [UpdateTypes.insights, UpdateTypes.release],
    roles: {
      'test@example.org': Roles.owner,
      'test1@example.org': Roles.administrator,
      'test2@example.org': Roles.author,
      'test3@example.org': Roles.member,
    }
  });

  expect(p.hasRole('test@example.org', ['owner', 'administrator'])).toEqual(true);
  expect(p.hasRole('test@example.org', ['administrator', 'member'])).toEqual(false);
  expect(p.hasRole('test99@example.org', ['owner', 'administrator', 'author', 'member'])).toEqual(false);
});