const omit = require('lodash.omit');
const { nanoid } = require('nanoid');

const { setup, setupAdmin, tearDown } = require('./helpers');
const { Project, UpdateTypes, Roles } = require('models');

const {
  verifyAndGetProject,
  issueToken,
  findRemovedTokens,
  revokeTokens,
  validateToken,
} = require('../utils/tokens');

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

test('issueToken', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const token = await issueToken(db, project, Roles.author, "Test");
  expect(token).toBeTruthy();

  const p1 = (await db.doc(project.getPath()).withConverter(Project).get()).data();
  expect(p1.tokens.length).toEqual(1);

  const projectTokenInfo = p1.tokens[0];
  expect(projectTokenInfo.uid).toBeTruthy();
  expect(projectTokenInfo.uid).not.toEqual(token);
  expect(projectTokenInfo.role).toEqual(Roles.author);
  expect(projectTokenInfo.name).toEqual("Test");
  expect(projectTokenInfo.creationDate).toBeInstanceOf(Date);

  const tokenSnapshot = await db.collection('_api_tokens').doc(token).get();
  expect(tokenSnapshot.exists).toEqual(true);

  const tokenData = tokenSnapshot.data();
  expect(omit(tokenData, 'creationDate')).toEqual({
    projectId: p1.id,
    role: Roles.author,
    uid: projectTokenInfo.uid,
    name: "Test"
  });
  expect(tokenData.creationDate.toDate()).toEqual(projectTokenInfo.creationDate);

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

  expect(findRemovedTokens(before, before)).toEqual([]);
  expect(findRemovedTokens(before, after)).toEqual(['234']);

});

test('revokeTokens', async() => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project)
  });

  const t1 = await issueToken(db, project, Roles.author, "T1");
  const t2 = await issueToken(db, project, Roles.author, "T2");
  const t3 = await issueToken(db, project, Roles.author, "T3");
  
  const p1 = (await db.doc(project.getPath()).withConverter(Project).get()).data();

  expect(p1.tokens.length).toEqual(3);
  const uidsToRemove = [p1.tokens[0].uid, p1.tokens[1].uid];

  expect((await db.collection('_api_tokens').doc(t1).get()).exists).toEqual(true);
  expect((await db.collection('_api_tokens').doc(t2).get()).exists).toEqual(true);
  expect((await db.collection('_api_tokens').doc(t3).get()).exists).toEqual(true);

  await revokeTokens(db, uidsToRemove);

  expect((await db.collection('_api_tokens').doc(t1).get()).exists).toEqual(false);
  expect((await db.collection('_api_tokens').doc(t2).get()).exists).toEqual(false);
  expect((await db.collection('_api_tokens').doc(t3).get()).exists).toEqual(true);

  // function is idempotent
  await revokeTokens(db, uidsToRemove);

  expect((await db.collection('_api_tokens').doc(t1).get()).exists).toEqual(false);
  expect((await db.collection('_api_tokens').doc(t2).get()).exists).toEqual(false);
  expect((await db.collection('_api_tokens').doc(t3).get()).exists).toEqual(true);
});

test('validateToken', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project)
  });

  const t1 = await issueToken(db, project, Roles.author, "T1");
  const t2 = await issueToken(db, project, Roles.author, "T2");
  const t3 = await issueToken(db, project, Roles.author, "T3");
  
  const t1Data = await validateToken(db, t1, [Roles.author]);
  expect(omit(t1Data, 'creationDate', 'uid')).toEqual({
    projectId: project.id,
    role: Roles.author,
    name: "T1"
  });

  expect(await validateToken(db, t2, [Roles.author])).toBeTruthy();
  expect(await validateToken(db, t3, [Roles.author])).toBeTruthy();

  // roles don't match
  expect(await validateToken(db, t1, [Roles.owner])).toEqual(null);

  // token revoked
  await revokeTokens(db, [t1Data.uid]);
  expect(await validateToken(db, t1, [Roles.author])).toEqual(null);
  
  // token not on project
  const p1 = (await db.doc(project.getPath()).get()).data();
  db.doc(project.getPath()).update({
    tokens: p1.tokens.filter(t => !["T1", "T2"].includes(t.name))
  });
  expect(await validateToken(db, t2, [Roles.author])).toEqual(null);
  expect(await validateToken(db, t3, [Roles.author])).toBeTruthy();

  // project does not exist
  await db.doc(project.getPath()).delete();
  expect(await validateToken(db, t1, [Roles.author])).toEqual(null);
  expect(await validateToken(db, t2, [Roles.author])).toEqual(null);
  expect(await validateToken(db, t3, [Roles.author])).toEqual(null);
});

test('tokens collection is secret', async () => {
  const uid = nanoid(32);
  const token = nanoid(64);

  const tokenPath = `_api_tokens/${token}`;

  const db = await setup({
    uid: '1',
    email: 'owner@example.org'
  }, {
    [project.getPath()]: Project.toFirestore(project),
    [tokenPath]: {
      projectId: project.id,
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Test token",
      uid,
    }
  });

  await expect(db.doc(project.getPath()).get()).toBeAllowed();
  await expect(db.doc(tokenPath).get()).toBeDenied();

  await expect(db.collection('_api_tokens').add({
    projectId: project.id,
      role: Roles.author,
      creationDate: new Date(2020, 0, 1),
      name: "Sneaky",
      uid,
  })).toBeDenied();
});