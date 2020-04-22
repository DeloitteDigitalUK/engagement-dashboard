const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const Yup = require('yup');

const releaseUpdateSchema = Update.getSchema().concat(Yup.object({
  releaseDate: Yup.date().notRequired(),
  status: Yup.string().oneOf(['in-progress', 'complete', 'overdue']).required().default('in-progress'),
  text: Yup.string().required().default(""),
}));

class ReleaseUpdate extends Update {
  static getSchema() { return releaseUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.release, ReleaseUpdate);

module.exports = ReleaseUpdate;