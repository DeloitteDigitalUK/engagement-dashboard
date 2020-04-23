const Yup = require('yup');
const pick = require('lodash.pick');

const schema = Yup.object({});

/**
 * Base class for data model types that exist in Firestore.
 * 
 * Each type defines a schema using Yup, returned by `ModelClass.getSchema()`,
 * which describes the data *as stored in Firebase*. It is assumed that this
 * same schema defines how the data is stored on instances of this class.
 * 
 * The constructor, `update()` method, and static Firebase converter functions
 * will throw if the object/argument is not valid according to the schema.
 * 
 * Each type should also define its parent collection name, returned by
 * `ModelClass.getCollectionName()`. This in turn will allow `getPath()` to
 * calculate the path to an instance (assuming it has an id set).
 * 
 * The Model class implements the `FirebaseConverter` API (without an explicit
 * dependency on Firebase libraries), allowing you to use the *class* of your
 * models (i.e. a subclass of this base class) as the argument to the
 * `withConverter()` function.
 */
class Model {

  /**
   * Define the schema used to validate this instance.
   * Subclasses should override this.
   */
  static getSchema() { return schema; }

  /**
   * Return the name of the collection.
   * Subclasses should override this.
   */
  static getCollectionName() {return ""; }

  /**
   * The default constructor takes a data object that conforms to the schema,
   * casts and validates it, and then sets the validated key/value pairs onto
   * the new object. The id is the document ID.
   */
  constructor(id=null, data=null) {
    this._id = id;

    // Set schema default values - not necessarily valid yet!
    Object.assign(this, this.constructor.getSchema().default());
    
    if(data) {
      this.update(data)
    }
  }

  /**
   * Convert an instance of this model to an object that can be stored
   * in Firestore. The data is validated (and so the function may throw).
   * 
   * Allows the model sub-class to be used as an argument to Firebase's
   * `withConverter()`.
   */
  static toFirestore(instance) {
    return this.getSchema().validateSync(instance.toObject());
  }

  /**
   * Convert from a Firestore snapshot to an instance of this model.
   * 
   * Allows the model sub-class to be used as an argument to Firebase's
   * `withConverter()`.
   */
  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return new this(snapshot.id, data);
  }

  /**
   * Set and validate fields according to the schema
   */
  update(data) {
    const schema = Yup.object(pick(this.constructor.getSchema().fields, Object.keys(data)));
    Object.assign(this, schema.validateSync(data));
  }

  /**
   * Validate the current state of the object. May throw a validation error.
   */
  validate() {
    this.constructor.getSchema().validateSync(this.toObject());
  }

  /**
   * Return whether or not this object is valid
   */
  isValid() {
    return this.constructor.getSchema().isValidSync(this.toObject());
  }

  toObject() {
    return pick(this, Object.keys(this.constructor.getSchema().fields));
  }

  // Helper methods to find the object in Firestore

  getId() {
    return this._id;
  }

  setId(value) {
    this._id = value;
  }

  getPath(parent=null) {
    if(!this.getId()) {
      throw new Error("Cannot construct a path for an object with no id");
    }

    const path = `${this.constructor.getCollectionName()}/${this.getId()}`
    return parent !== null? `${parent.getPath()}/${path}` : path;
  }

}

module.exports = Model;