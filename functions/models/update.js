const Yup = require('yup');

const Model = require('./base');
const UpdateTypes = require('./updateTypes');

const updateSchema = Yup.object({

  type: Yup.string().required().oneOf(Object.values(UpdateTypes)),
  
  title: Yup.string().required().default(""),
  summary: Yup.string().notRequired().default(""),
  date: Yup.date().required().default(null),
  team: Yup.string().notRequired(),

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

  static registerUpdateType(type, cls) {
    this.typeRegister[type] = cls;
    this.typeNameLookup[cls] = type;
  }

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    
    // look up class in the registry
    const cls = this.typeRegister[data.type];
    if(!cls) {
      return new this(snapshot.id, data);
    }

    return new cls(snapshot.id, data);
  }

  // automatically set type
  constructor(id=null, data=null) {
    super(id, data);
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