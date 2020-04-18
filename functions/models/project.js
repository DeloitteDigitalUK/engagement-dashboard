const Yup = require('yup');
const fromPairs = require('lodash.frompairs');

const Model = require('./base');
const UpdateTypes = require('./updateTypes');
const Roles = require('./roles');

const validUpdateTypes = new Set(Object.values(UpdateTypes));
const validRoles = new Set(Object.values(Roles));

const isEmail = Yup.string().email();
const isRole = Yup.string().oneOf(validRoles);

const projectSchema = Yup.object({
  name: Yup.string().required().default(""),
  description: Yup.string().notRequired().default(""),
  updateTypes: Yup.array().of(Yup.string().oneOf(validUpdateTypes)).default([
    UpdateTypes.insights,
    UpdateTypes.releases,
  ]),
  
  // map email -> role name
  roles: Yup.object()
    // eslint-disable-next-line no-template-curly-in-string
    .test('contains-roles', "${path} must contain mappings of email addresses to roles", value => {
      for(let key in value) {
        if(!isEmail.isValidSync(key)) return false;
        if(!isRole.isValidSync(value[key])) return false;
      }
      return true;
    })
    // eslint-disable-next-line no-template-curly-in-string
    .test('must-have-an-owner', "${path} must contain an email address with the role of owner", value => {
      return Object.values(value).includes(Roles.owner);
    })
    .default({})
});

/**
 * A project that can contain updates.
 */
class Project extends Model {

  static getSchema() { return projectSchema; }
  static getCollectionName() { return "projects"; }

  // we use email addresses as keys in the `roles` table, but Firebase
  // doesn't play nicely with this in queries, so we encode '.' as '@@'
  // (which isn't valid in an email address)

  static encodeKey(key) {
    return key.replace('.', '@@');
  }

  static decodeKey(key) {
    return key.replace('@@', '.');
  }

  static toFirestore(instance) {
    let data = this.getSchema().validateSync(instance.toObject());
    data.roles = fromPairs(
      Object.keys(data.roles).map(k => [Project.encodeKey(k), data.roles[k]])
    );
    return data;
  }

  static fromFirestore(snapshot, options) {
    let data = snapshot.data(options);
    data.roles = fromPairs(
      Object.keys(data.roles).map(k => [Project.decodeKey(k), data.roles[k]])
    );
    return this.fromObject(snapshot.id, data);
  }

}

module.exports = Project;