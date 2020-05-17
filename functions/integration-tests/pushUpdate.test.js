/* eslint-disable no-await-in-loop */
const { setupAdmin, tearDown } = require('./helpers');
const { Project, UpdateTypes, Roles, Update, InsightsUpdate, FlowUpdate, GoalsUpdate } = require('models');

const Yup = require('yup');

const {
  pushUpdate,
  PushOperation
} = require('../utils/pushUpdate');

const project = new Project('1', {
  name: "My project",
  description: "A description",
  updateTypes: [UpdateTypes.insights, UpdateTypes.flow],
  teams: ['Alpha'],
  roles: { 'owner@example.org': Roles.owner, },
  tokens: []
});

const insightsUpdate = new InsightsUpdate(null, {
  title: "My update",
    summary: "An update",
    date: new Date(2020, 1, 1),
    team: "Alpha",
    
    authorId: '1',
    authorName: 'John',
    text: 'Some text'
}, project);

const flowUpdate = new FlowUpdate(null, {
  title: "My update",
  summary: "An update",
  date: new Date(2020, 1, 1),
  team: "Alpha",
  
  cycleTimeData: [{
    commitmentDate: new Date(2020, 1, 1),
    completionDate: null,
    item: "Hello",
    itemType: null,
    url: null
  }]
}, project);

const goalsUpdate = new GoalsUpdate(null, {
  title: "My update",
  summary: "An update",
  date: new Date(2020, 1, 1),
  team: "Alpha",
  
  authorId: '1',
  authorName: 'John',
  text: 'Some text'
}, project);

afterAll(async () => {
  await tearDown();
});

test('fails if project does not exist', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const updateData = insightsUpdate.toObject();

  await expect(pushUpdate(db, 'ringer', updateData)).rejects.toThrow(Error);
});

test('fails if no update type', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const updateData = insightsUpdate.toObject();
  delete updateData.type;

  await expect(pushUpdate(db, project.id, updateData)).rejects.toThrow(Yup.ValidationError);
});

test('fails if update type is not enabled for the project', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const updateData = goalsUpdate.toObject();

  await expect(pushUpdate(db, project.id, updateData)).rejects.toThrow(Yup.ValidationError);
});

test('fails if update type is no longer valid', async () => {
  // this could probably only happen if there was data corruption, or we
  // retired a previously valid update type, but still
  const db = await setupAdmin({
    [project.getPath()]: {
        ...Project.toFirestore(project),
        updateTypes: ['ringer']
      },
  });

  const updateData = insightsUpdate.toObject();
  updateData.type = 'ringer';
  
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await expect(pushUpdate(db, project.id, updateData)).rejects.toThrow(Yup.ValidationError);
  spy.mockRestore();
});

test('validates the update data', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const updateData = insightsUpdate.toObject();
  updateData.authorId =  null;

  await expect(pushUpdate(db, project.id, updateData)).rejects.toThrow(Yup.ValidationError);
});

test('can add an update', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
  });

  const updateData = insightsUpdate.toObject();

  const operation = await pushUpdate(db, project.id, updateData);
  expect(operation).toEqual(PushOperation.add);

  const updates = await db
    .collection(Update.getCollectionPath(project))
    .withConverter(Update)
    .get();
  
  expect(updates.size).toEqual(1);
  expect(updates.docs[0].data()).toEqual({
    ...insightsUpdate.toObject(),
    id: updates.docs[0].id,
    error: null,
    parent: null,
  });
});

test('can edit an update if the id matches', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    [`${Update.getCollectionPath(project)}/u1`]: InsightsUpdate.toFirestore(insightsUpdate)
  });

  const updateData = {
    ...insightsUpdate.toObject(),
    id: 'u1',
    authorId: '2'
  };

  const operation = await pushUpdate(db, project.id, updateData);
  expect(operation).toEqual(PushOperation.update);

  const updates = await db
    .collection(Update.getCollectionPath(project))
    .withConverter(Update)
    .get();
  
  expect(updates.size).toEqual(1);
  expect(updates.docs[0].data()).toEqual({
    ...insightsUpdate.toObject(),
    id: 'u1',
    authorId: '2',
    error: null,
    parent: null,
  });
});

test('fails if the an id is provided but does not match', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    [`${Update.getCollectionPath(project)}/u1`]: InsightsUpdate.toFirestore(insightsUpdate)
  });

  const updateData = {
    ...insightsUpdate.toObject(),
    id: 'u2',
    authorId: '2'
  };

  await expect(pushUpdate(db, project.id, updateData)).rejects.toThrow(Yup.ValidationError);
});

test('will always add update even if the id matches if alwaysCreate is true', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    [`${Update.getCollectionPath(project)}/u1`]: InsightsUpdate.toFirestore(insightsUpdate)
  });

  const updateData = {
    ...insightsUpdate.toObject(),
    id: 'u1',
    authorId: '2'
  };

  const operation = await pushUpdate(db, project.id, updateData, true);
  expect(operation).toEqual(PushOperation.add);

  const updates = await db
    .collection(Update.getCollectionPath(project))
    .withConverter(Update)
    .orderBy('authorId')
    .get();
  
  expect(updates.size).toEqual(2);
  expect(updates.docs[0].data()).toEqual({
    ...insightsUpdate.toObject(),
    id: 'u1',
    error: null,
    parent: null,
  });
  expect(updates.docs[1].data()).toEqual({
    ...insightsUpdate.toObject(),
    id: updates.docs[1].id,
    authorId: '2',
    error: null,
    parent: null,
  });
});

test('can edit an update with partial data if the id matches', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    [`${Update.getCollectionPath(project)}/u1`]: InsightsUpdate.toFirestore(insightsUpdate)
  });

  const updateData = {
    type: UpdateTypes.insights,
    id: 'u1',
    authorId: '2'
  };

  const operation = await pushUpdate(db, project.id, updateData);
  expect(operation).toEqual(PushOperation.update);

  const updates = await db
    .collection(Update.getCollectionPath(project))
    .withConverter(Update)
    .get();
  
  expect(updates.size).toEqual(1);
  expect(updates.docs[0].data()).toEqual({
    ...insightsUpdate.toObject(),
    id: 'u1',
    authorId: '2',
    error: null,
    parent: null,
  });
});

test('can edit a flow update if the team field matches', async () => {
  const db = await setupAdmin({
    [project.getPath()]: Project.toFirestore(project),
    [`${Update.getCollectionPath(project)}/u1`]: FlowUpdate.toFirestore(flowUpdate)
  });

  const updateData = {
    type: UpdateTypes.flow,
    team: "Alpha",
    cycleTimeData: [{
      commitmentDate: new Date(2020, 2, 1),
      completionDate: null,
      item: "Hello",
      itemType: null,
      url: null
    },{
      commitmentDate: new Date(2020, 2, 1),
      completionDate: new Date(2020, 2, 5),
      item: "Good bye",
      itemType: "Test",
      url: null
    }]
  };

  const operation = await pushUpdate(db, project.id, updateData);
  expect(operation).toEqual(PushOperation.update);

  const updates = await db
    .collection(Update.getCollectionPath(project))
    .withConverter(Update)
    .get();
  
  expect(updates.size).toEqual(1);
  expect(updates.docs[0].data()).toEqual({
    ...flowUpdate.toObject(),
    id: 'u1',
    error: null,
    parent: null,
    cycleTimeData: [{
      commitmentDate: new Date(2020, 2, 1),
      completionDate: null,
      item: "Hello",
      itemType: null,
      url: null
    },{
      commitmentDate: new Date(2020, 2, 1),
      completionDate: new Date(2020, 2, 5),
      item: "Good bye",
      itemType: "Test",
      url: null
    }]
  });
});
