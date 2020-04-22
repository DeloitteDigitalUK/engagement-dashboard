const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const Yup = require('yup');

const insightsUpdateSchema = Update.getSchema().concat(Yup.object({
  authorId: Yup.string().required().default(""),
  authorName: Yup.string().required().default(""),
  text: Yup.string().required().default(""),
}));

class InsightsUpdate extends Update {
  static getSchema() { return insightsUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.insights, InsightsUpdate);

module.exports = InsightsUpdate;