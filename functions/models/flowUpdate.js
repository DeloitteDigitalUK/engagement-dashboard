const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const Yup = require('yup');

const flowUpdateSchema = Update.getSchema().concat(Yup.object({
  cycleTimeData: Yup.array().of(Yup.object({
    commitmentDate: Yup.date().required(),
    completionDate: Yup.date().notRequired(),
    item: Yup.string().required(),
    itemType: Yup.string().notRequired(),
    url: Yup.string().url().notRequired(),
  }).required()).default([])
}));

class FlowUpdate extends Update {
  static getSchema() { return flowUpdateSchema; }
}

Update.registerUpdateType(UpdateTypes.flow, FlowUpdate);

module.exports = FlowUpdate;