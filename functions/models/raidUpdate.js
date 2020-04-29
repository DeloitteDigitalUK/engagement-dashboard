const Yup = require('yup');

const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const raidUpdateSchema = Update.getSchema().concat(Yup.object({
  raidItems: Yup.array().of(Yup.object({
    type: Yup.string().label("Type").oneOf(['risk', 'issue', 'assumption', 'dependency', 'decision']).required(),
    summary: Yup.string().label("Summary").required().default(""),
    url: Yup.string().label("Link").url().notRequired().nullable().default(null),
    priority: Yup.string().label("Priority").oneOf(['low', 'medium', 'high']).required().default('medium'),
    date: Yup.date().label("Date").transform(transformDate).notRequired().nullable().default(null)
  })).label("RAID items").required().default([])
}));

class RaidUpdate extends Update {
  static getSchema() { return raidUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.raid, RaidUpdate);

module.exports = RaidUpdate;