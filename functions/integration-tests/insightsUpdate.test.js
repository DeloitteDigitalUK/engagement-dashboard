/* eslint-disable no-await-in-loop */
const { setup, tearDown } = require('./helpers');
const {
  Project,
  UpdateTypes,
  Roles,
  Update,
  InsightsUpdate
} = require('models');

const UpdateClass = InsightsUpdate;

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

const owner = {uid: '1', email: 'owner@example.org'},
      admin = {uid: '2', email: 'admin@example.org'},
      author = {uid: '3', email: 'author@example.org'},
      member = {uid: '4', email: 'member@example.org'};

const u1 = new UpdateClass('1', {
    title: "My update",
    summary: "An update",
    date: new Date(2020, 1, 1),
    team: "Alpha",
    
    authorId: '1',
    authorName: 'John',
    text: 'Some text'
  }, project);

// everything below should in theory be the same for all update types

afterAll(async () => {
  await tearDown();
});

describe('security', () => {

  test('owner can create, read, update, delete', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    await expect(
      db.collection(Update.getCollectionPath(project))
        .withConverter(Update)
        .add(new UpdateClass(null, u1.toObject(), project))
    ).toBeAllowed();

    await expect(db.doc(u1.getPath()).get()).toBeAllowed();
    await expect(db.doc(u1.getPath()).update({title: 'Changed update'})).toBeAllowed();
    await expect(db.doc(u1.getPath()).delete()).toBeAllowed();
  });

  test('admin can create, read, update, delete', async () => {
    const db = await setup(admin, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    await expect(
      db.collection(Update.getCollectionPath(project))
        .withConverter(Update)
        .add(new UpdateClass(null, u1.toObject(), project))
    ).toBeAllowed();

    await expect(db.doc(u1.getPath()).get()).toBeAllowed();
    await expect(db.doc(u1.getPath()).update({title: 'Changed update'})).toBeAllowed();
    await expect(db.doc(u1.getPath()).delete()).toBeAllowed();
  });

  test('author can create, read, update, delete', async () => {
    const db = await setup(author, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    await expect(
      db.collection(Update.getCollectionPath(project))
        .withConverter(Update)
        .add(new UpdateClass(null, u1.toObject(), project))
    ).toBeAllowed();

    await expect(db.doc(u1.getPath()).get()).toBeAllowed();
    await expect(db.doc(u1.getPath()).update({title: 'Changed update'})).toBeAllowed();
    await expect(db.doc(u1.getPath()).delete()).toBeAllowed();
  });

  test('member can only read', async () => {
    const db = await setup(member, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    await expect(
      db.collection(Update.getCollectionPath(project))
        .withConverter(Update)
        .add(new UpdateClass(null, u1.toObject(), project))
    ).toBeDenied();

    await expect(db.doc(u1.getPath()).get()).toBeAllowed();
    await expect(db.doc(u1.getPath()).update({title: 'Changed update'})).toBeDenied();
    await expect(db.doc(u1.getPath()).delete()).toBeDenied();
  });
  
});

describe('conversion', () => {

  test('round trip write and read with type lookup', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
    });

    const u2 = new UpdateClass('2', u1.toObject(), project);
    await db.doc(u2.getPath()).withConverter(Update).set(u2);

    const u3 = (await db.doc(u2.getPath()).withConverter(Update).get()).data();
    
    expect(u3.constructor).toEqual(UpdateClass);
    expect(u3.toObject()).toEqual(u2.toObject());
  });

  test('recovery of broken object (invalid title)', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: {
        ...Update.toFirestore(u1),
        date: "foo",
        title: null
      }
    });

    // hide expected error logging
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const u2 = (await db.doc(u1.getPath()).withConverter(Update).get()).data();
    spy.mockRestore();

    expect(u2.constructor).toEqual(UpdateClass);
    expect(u2.error).toBeTruthy();
    expect(u2.toObject()).toEqual({
      ...Update.toFirestore(u1),
      date: "foo",
      title: null
    });
    
  });

  test('recovery of broken object (invalid type)', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: {
        ...Update.toFirestore(u1),
        type: 'not-valid'
      }
    });

    // hide expected error logging
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const u2 = (await db.doc(u1.getPath()).withConverter(Update).get()).data();
    spy.mockRestore();

    expect(u2.constructor).toEqual(Update);
    expect(u2.error).toBeTruthy();
    expect(u2.title).toEqual(u1.title);
    expect(u2.type).toEqual('not-valid');
  });

});

describe('validation', () => {

  test('must have all required keys', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const requiredKeys = Object.entries(UpdateClass.getSchema().fields).filter(([k, v]) => v._exclusive.required).map(([k, v]) => k);

    for(let key of requiredKeys) {
      let data = {...u1.toObject()};

      await expect(db.collection(UpdateClass.getCollectionPath(project)).add(data)).toBeAllowed();
      await expect(db.doc(u1.getPath()).set(data)).toBeAllowed();
      
      delete data[key];

      await expect(db.collection(UpdateClass.getCollectionPath(project)).add(data)).toBeDenied();
      await expect(db.doc(u1.getPath()).set(data)).toBeDenied();
    }
  });

  test('cannot have unknown keys', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {ringer: 1};
    const valid = u1.toObject();
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

  test('must have a valid update type', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {type: 'not-valid'};
    const valid = u1.toObject();
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

  test('must have a string title', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {title: false};
    const valid = u1.toObject();
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

  test('must have a string summary', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {summary: 123};
    const valid = u1.toObject();
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

  test('must have a timestamp date', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {date: "yesterday"};
    const valid = u1.toObject();
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

  test('must have a null or string team', async () => {
    const db = await setup(owner, {
      [project.getPath()]: Project.toFirestore(project),
      [u1.getPath()]: Update.toFirestore(u1)
    });

    const ringer = {team: true};
    const valid = {...u1.toObject(), team: null};
    const invalid = {...valid, ...ringer};

    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(valid)).toBeAllowed();
    await expect(db.collection(UpdateClass.getCollectionPath(project)).add(invalid)).toBeDenied();

    await expect(db.doc(u1.getPath()).update(valid)).toBeAllowed();
    await expect(db.doc(u1.getPath()).update(ringer)).toBeDenied();
  });

});