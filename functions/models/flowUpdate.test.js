const FlowUpdate = require('./flowUpdate');
const UpdateTypes = require('./updateTypes');

test('can construct a new update', () => {
  const t = new FlowUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes.flow,
    title: "",
    summary: "",
    date: null,
    team: undefined,
    cycleTimeData: []
  });
});
