const Yup = require('yup');

const Model = require('./base');
const UpdateTypes = require('./updateTypes');
const Roles = require('./roles');

const validUpdateTypes = new Set(Object.values(UpdateTypes));
const validRoles = new Set(Object.values(Roles));

const isEmail = Yup.string().email();
const isRole = Yup.string().oneOf(validRoles);

const projectSchema = Yup.object({
  owner: Yup.string().required(), // user id
  
  name: Yup.string().required(),
  description: Yup.string().notRequired().default(""),
  updateTypes: Yup.array().of(Yup.string().oneOf(validUpdateTypes)).default([]),
  
  // map email -> role name
  roles: Yup.object().test('contains-roles', "${path} must contain mappings of email addresses to roles", value => {
    for(let key in value) {
      if(!isEmail.isValidSync(key)) return false;
      if(!isRole.isValidSync(value[key])) return false;
    }
    return true;
  }).default({})
});

/**
 * A project that can contain updates.
 */
class Project extends Model {

  static getSchema = () => projectSchema;
  static getCollectionName = () => "projects";

};

module.exports = Project;