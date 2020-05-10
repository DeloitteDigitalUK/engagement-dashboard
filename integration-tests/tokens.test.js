const { setupAdmin, tearDown } = require('./helpers');
const { Project, UpdateTypes, Roles } = require('models');

const {
  findRemovedTokens,
  verifyAndGetProject,
  addTokenToProject
} = require('../functions/utils/tokens');

const project = new Project('1', {
  name: "My project",
  description: "A description",
  updateTypes: [UpdateTypes.insights],
  teams: [],
  roles: {
    'owner@example.org': Roles.owner,
    'admin@example.org': Roles.administrator,
    'author@example.org': Roles.author,
    'member@example.org': Roles.member,
  },
  tokens: []
});

afterAll(async () => {
  await tearDown();
});

test('findRemovedTokens', async () => {
  
  const before = {
    name: "My project",
    description: "A description",
    updateTypes: [UpdateTypes.insights],
    teams: [],
    roles: { 'owner@example.org': Roles.owner },
    tokens: [{
      uid: '123',
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Test token",
    }, {
      uid: '234',
      role: Roles.author,
      creationDate: new Date(2020, 0, 2),
      name: "Test token",
    }]
  };

  const after = {
    name: "My project",
    description: "A description",
    updateTypes: [UpdateTypes.insights],
    teams: [],
    roles: { 'owner@example.org': Roles.owner },
    tokens: [{
      uid: '123',
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Test token",
    }]
  };

  expect(findRemovedTokens(before, before)).toEqual(new Set([]));
  expect(findRemovedTokens(before, after)).toEqual(new Set(['234']));

});

test('verifyAndGetProject', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const p1 = await verifyAndGetProject(db, project.id, 'owner@example.org');
  expect(p1.toObject()).toEqual(project.toObject());

  await expect(verifyAndGetProject(db, 'blah', 'owner@example.org')).rejects.toThrow();
  await expect(verifyAndGetProject(db, project.id, 'admin@example.org')).rejects.toThrow();
  await expect(verifyAndGetProject(db, project.id, 'owner@example.org', [Roles.member])).rejects.toThrow();
  await expect(verifyAndGetProject(db, project.id, 'owner@example.org', [Roles.owner])).resolves.not.toThrow();
});

test('addTokenToProject', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const p1 = (await db.doc(project.getPath()).withConverter(Project).get()).data();
  
  await addTokenToProject(db, p1, 'uid123', Roles.author, 'A token');
  expect(p1.tokens.length).toEqual(1);
  expect(p1.tokens[0].uid).toEqual('uid123');
  expect(p1.tokens[0].name).toEqual('A token');
  expect(p1.tokens[0].role).toEqual(Roles.author);
  expect(p1.tokens[0].creationDate).toBeInstanceOf(Date);

  const p2 = (await db.doc(project.getPath()).withConverter(Project).get()).data();
  expect(p2.tokens.length).toEqual(1);
  expect(p2.tokens[0].uid).toEqual('uid123');
  expect(p2.tokens[0].name).toEqual('A token');
  expect(p2.tokens[0].role).toEqual(Roles.author);
  expect(p2.tokens[0].creationDate).toBeInstanceOf(Date);

  await addTokenToProject(db, p2, 'uid321', Roles.author, 'Another token');
  expect(p2.tokens.length).toEqual(2);
  expect(p2.tokens[1].uid).toEqual('uid321');
  expect(p2.tokens[1].name).toEqual('Another token');
  expect(p2.tokens[1].role).toEqual(Roles.author);
  expect(p2.tokens[1].creationDate).toBeInstanceOf(Date);

  const p3 = (await db.doc(project.getPath()).withConverter(Project).get()).data();
  expect(p3.tokens.length).toEqual(2);
  expect(p3.tokens[1].uid).toEqual('uid321');
  expect(p3.tokens[1].name).toEqual('Another token');
  expect(p3.tokens[1].role).toEqual(Roles.author);
  expect(p3.tokens[1].creationDate).toBeInstanceOf(Date);
});
