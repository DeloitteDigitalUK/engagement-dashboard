const Yup = require('yup');

const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const releaseUpdateSchema = Update.getSchema().concat(Yup.object({
  releaseDate: Yup.date().label("Release date").transform(transformDate).notRequired().nullable().default(null),
  status: Yup.string().label("Status").oneOf(['in-progress', 'complete', 'overdue']).required().default('in-progress'),
  text: Yup.string().label("Text").required().default(""),
}));

class ReleaseUpdate extends Update {
  static getSchema() { return releaseUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.release, ReleaseUpdate);

module.exports = ReleaseUpdate;