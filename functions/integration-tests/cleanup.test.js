/* eslint-disable no-await-in-loop */
const { setupAdmin, tearDown } = require('./helpers');
const {
  Project,
  UpdateTypes,
  Roles,
  Update,
  InsightsUpdate
} = require('models');

const { cleanUp } = require('../utils/cleanup');

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
  }
});

const updates = [...Array(50).keys()].map(i => (
  new InsightsUpdate(`update-${i}`, {
    title: `Update ${i}`,
    summary: "An update",
    date: new Date(2020, 1, 1),
    team: "Alpha",
    
    authorId: '1',
    authorName: 'John',
    text: 'Some text'
  }, project)
));

afterAll(async () => {
  await tearDown();
});

test('deletes multiple updates in a single batch', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    ...updates.reduce((acc, v) => ({...acc, [v.getPath()]: Update.toFirestore(v)}), {})
  });

  expect((await db.doc(project.getPath()).get()).exists).toEqual(true);
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(true);
  }

  await db.doc(project.getPath()).delete();

  expect((await db.doc(project.getPath()).get()).exists).toEqual(false);

  // trigger hasn't run (emulator suite weakness)
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(true);
  }
  
  // simulate firestore trigger

  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cleanUp(db, Update.getCollectionPath(project));
  spy.mockRestore();

  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(false);
  }
});

test('deletes multiple updates in multiple batches', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    ...updates.reduce((acc, v) => ({...acc, [v.getPath()]: Update.toFirestore(v)}), {})
  });

  expect((await db.doc(project.getPath()).get()).exists).toEqual(true);
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(true);
  }

  await db.doc(project.getPath()).delete();

  expect((await db.doc(project.getPath()).get()).exists).toEqual(false);

  // trigger hasn't run (emulator suite weakness)
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(true);
  }
  
  // simulate firestore trigger

  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cleanUp(db, Update.getCollectionPath(project), 10);
  spy.mockRestore();

  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(false);
  }
});

test('does nothing if there are no documents to be found', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  expect((await db.doc(project.getPath()).get()).exists).toEqual(true);
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(false);
  }

  await db.doc(project.getPath()).delete();

  expect((await db.doc(project.getPath()).get()).exists).toEqual(false);

  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cleanUp(db, Update.getCollectionPath(project));
  spy.mockRestore();

  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(false);
  }
});

test('ignores non-existent paths', async () => {
  const db = await setupAdmin({
  });

  expect((await db.doc(project.getPath()).get()).exists).toEqual(false);
  for(let u of updates) {
    expect((await db.doc(u.getPath()).get()).exists).toEqual(false);
  }

  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cleanUp(db, Update.getCollectionPath(project));
  spy.mockRestore();

});