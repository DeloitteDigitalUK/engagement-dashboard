const GoalsUpdate = require('./goalsUpdate');
const UpdateTypes = require('./updateTypes');

test('can construct a new update', () => {
  const t = new GoalsUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes.goals,
    title: "",
    summary: "",
    date: null,
    team: undefined,
    authorId: "",
    authorName: "",
    text: "",
  });
});
