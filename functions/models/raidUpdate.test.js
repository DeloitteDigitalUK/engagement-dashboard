const RaidUpdate = require('./raidUpdate');
const UpdateTypes = require('./updateTypes');

test('can construct a new update', () => {
  const t = new RaidUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes.raid,
    title: "",
    summary: "",
    date: null,
    team: undefined,
    raidItems: []
  });
});
