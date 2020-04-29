const Yup = require('yup');

const fromPairs = require('lodash.frompairs');
const findKey = require('lodash.findkey');

const Model = require('./base');
const UpdateTypes = require('./updateTypes');
const Roles = require('./roles');

const validUpdateTypes = new Set(Object.values(UpdateTypes));
const validRoles = new Set(Object.values(Roles));

const isEmail = Yup.string().email();
const isRole = Yup.string().oneOf(validRoles);

const projectSchema = Yup.object({
  name: Yup.string().label("Project name").required().default(""),
  description: Yup.string().label("Description").notRequired().default(""),
  updateTypes: Yup.array().of(Yup.string().oneOf(validUpdateTypes)).label("Enabled update types").default([
    UpdateTypes.goals,
    UpdateTypes.insights,
    UpdateTypes.release,
    UpdateTypes.raid
  ]),
  teams: Yup.array().of(Yup.string()).label("Teams").notRequired().default([]),
  
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

  /**
   * Test if the given email address has the current role or roles
   */
  hasRole(email, roles) {
    if(!Array.isArray(roles)) {
      roles = [roles];
    }
    return roles.includes(this.roles[email]);
  }

  // we use email addresses as keys in the `roles` table, but Firebase
  // doesn't play nicely with this in queries, so we encode '.' as '@@'
  // (which isn't valid in an email address)
  //
  // we also automatically set and get the `owner` field

  static encodeKey(key) {
    return key.replace(/\./g, '@@');
  }

  static decodeKey(key) {
    return key.replace(/@@/g, '.');
  }

  static toFirestore(instance) {
    let data = this.getSchema().validateSync(instance.toObject());
    data.roles = fromPairs(
      Object.keys(data.roles).map(k => [Project.encodeKey(k), data.roles[k]])
      );
    data.owner = findKey(data.roles, v => v === Roles.owner);
    return data;
  }

  static fromFirestore(snapshot, options) {
    let data = snapshot.data(options);
    data.roles = fromPairs(
      Object.keys(data.roles).map(k => [Project.decodeKey(k), data.roles[k]])
    );
    return this._constructFromData(this, snapshot.id, data);
  }

}

module.exports = Project;