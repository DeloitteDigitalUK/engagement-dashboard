const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const Yup = require('yup');

const goalsUpdateSchema = Update.getSchema().concat(Yup.object({
  authorId: Yup.string().label("Author ID").required().default(""),
  authorName: Yup.string().label("Author name").required().default(""),
  text: Yup.string().label("Text").required().default(""),
}));

class GoalsUpdate extends Update {
  static getSchema() { return goalsUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.goals, GoalsUpdate);

module.exports = GoalsUpdate;