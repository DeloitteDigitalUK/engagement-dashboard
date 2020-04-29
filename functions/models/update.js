const Yup = require('yup');

const Model = require('./base');
const UpdateTypes = require('./updateTypes');
const { transformDate } = require('./utils');

const updateSchema = Yup.object({
  type: Yup.string().required().oneOf(Object.values(UpdateTypes)),
  
  title: Yup.string().label("Title").required().default(""),
  summary: Yup.string().label("Summary").notRequired().default(""),
  date: Yup.date().label("Date").transform(transformDate).required().default(null),
  team: Yup.string().label("Team").notRequired().nullable().default(null),
});

/**
 * Base model for updates. Sub-classes should:
 * 
 * - Define a schema that extends the `updateSchema` via `concat()`
 * - *Not* override the collection name (all updates are stored in the same
 *   sub-collection under their project)
 * - *Not* set the `type` property explicitly
 * - Call `Update.registerUpdateType(UpdateTypes.foo, FooUpdate)`
 * 
 * This will ensure the Firestore load converter returns an instance of the
 * correct class.
 */
class Update extends Model {

  static getSchema() { return updateSchema; }
  static getCollectionName() { return "updates"; }
  
  /**
   * When receiving a new update over an API call, it is sometimes desirable
   * to modify an existing update, rather than creat a new one, e.g. if there
   * is meant to be only one active update per team. Update types can return a
   * non-null key name from this static method to enable this behaviour.
   */
  static getUpdateKey(data) { return 'id' in data? 'id': null; }

  /**
   * Call this function with a type name (string) and class (constructor)
   * for each update type to register.
   */
  static registerUpdateType(type, cls) {
    this.typeRegister[type] = cls;
    this.typeNameLookup[cls] = type;
  }

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options),
          cls = data.type in this.typeRegister? this.typeRegister[data.type] : this;
    return this._constructFromData(cls, snapshot.id, data);
  }

  constructor(id=null, data=null, parent=null, error=null) {
    super(id, data, parent, error);
    // automatically set type
    this.type = Update.typeNameLookup[this.constructor];
  }


  update(data) {
    // ensure we don't accidentally get class and type out of sync
    if(data.type && Update.typeRegister[data.type] !== this.constructor) {
      throw new Yup.ValidationError("Type does not match class", data.type, "type");
    }
    return super.update(data);
  }

}

Update.typeRegister = {};
Update.typeNameLookup = {};

module.exports = Update;