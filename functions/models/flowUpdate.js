const Yup = require('yup');

const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const flowUpdateSchema = Update.getSchema().concat(Yup.object({
  cycleTimeData: Yup.array().of(Yup.object({
    item: Yup.string().required().default(""),
    commitmentDate: Yup.date().transform(transformDate).required(),
    completionDate: Yup.date().transform(transformDate).notRequired().nullable().default(null),
    itemType: Yup.string().notRequired().nullable().default(null),
    url: Yup.string().url().notRequired().nullable().default(null),
  }).required()).default([])
}));

class FlowUpdate extends Update {
  static getSchema() { return flowUpdateSchema; }
  static getUpdateKey(data) { return "team"; }
}

Update.registerUpdateType(UpdateTypes.flow, FlowUpdate);

module.exports = FlowUpdate;