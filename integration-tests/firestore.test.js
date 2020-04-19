const { setup, tearDown } = require('./helpers');

describe('Database rules', () => {

  afterAll(async () => {
    await tearDown();
  });
  
  test('cannot add unknown collection', async () => {
    const db = await setup();
    expect(db.collection('foo').add({})).toBeDenied();
  });
  
});