const InsightsUpdate = require('./insightsUpdate');
const UpdateTypes = require('./updateTypes');

test('can construct a new update', () => {
  const t = new InsightsUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes.insights,
    title: "",
    summary: "",
    date: null,
    team: undefined,
    authorId: "",
    authorName: "",
    text: "",
  });
});
