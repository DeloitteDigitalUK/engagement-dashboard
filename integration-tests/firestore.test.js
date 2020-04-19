const { setup, tearDown } = require('./helpers');

describe('Database rules', () => {
  let db;

  beforeAll(async () => {
    db = await setup();
  });

  afterAll(async () => {
    await tearDown();
  });

  test('cannot add unknown collection', async () => {
    expect(db.collection('foo').add({})).toBeDenied();
  });
});