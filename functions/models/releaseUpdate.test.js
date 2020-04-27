const ReleaseUpdate = require('./releaseUpdate');
const UpdateTypes = require('./updateTypes');

test('can construct a new update', () => {
  const t = new ReleaseUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes.release,
    title: "",
    summary: "",
    date: null,
    team: null,
    releaseDate: null,
    status: 'in-progress',
    text: ""
  });
});
