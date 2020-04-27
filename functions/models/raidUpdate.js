const Yup = require('yup');

const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const raidUpdateSchema = Update.getSchema().concat(Yup.object({
  raidItems: Yup.array().of(Yup.object({
    type: Yup.string().oneOf(['risk', 'issue', 'assumption', 'dependency', 'decision']).required(),
    summary: Yup.string().required().default(""),
    url: Yup.string().url().notRequired(),
    priority: Yup.string().oneOf(['low', 'medium', 'high']).notRequired(),
    date: Yup.date().transform(transformDate).notRequired().nullable().default(null)
  })).required().default([])
}));

class RaidUpdate extends Update {
  static getSchema() { return raidUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.raid, RaidUpdate);

module.exports = RaidUpdate;