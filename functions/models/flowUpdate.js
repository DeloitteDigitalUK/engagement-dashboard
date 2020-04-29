const Yup = require('yup');

const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const flowUpdateSchema = Update.getSchema().concat(Yup.object({
  cycleTimeData: Yup.array().of(Yup.object({
    item: Yup.string().label("Item key").required().default(""),
    commitmentDate: Yup.date().label("Commitment date").transform(transformDate).required(),
    completionDate: Yup.date().label("Completion date").transform(transformDate).notRequired().nullable().default(null),
    itemType: Yup.string().label("Item type").notRequired().nullable().default(null),
    url: Yup.string().label("Item URL").url().notRequired().nullable().default(null),
  }).label("Data").required()).default([])
}));

class FlowUpdate extends Update {
  static getSchema() { return flowUpdateSchema; }
  static getUpdateKey(data) { return "team"; }
}

Update.registerUpdateType(UpdateTypes.flow, FlowUpdate);

module.exports = FlowUpdate;