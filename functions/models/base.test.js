const Model = require('./base');
const Yup = require('yup');

const testSchema = Yup.object({
  name: Yup.string().default("Anonymous"),
  email: Yup.string().email().required().default("")
});

class TestModel extends Model {
  static getSchema() { return testSchema; };
  static getCollectionName() { return "testModels"; }
}

describe("constructor", () => {
  test('can construct a valid object with defaults (even if not valid)', () => {
    const t = new TestModel();
    expect(t.getId()).toEqual(null);
    expect(t.toObject()).toEqual({name: "Anonymous", email: ""});
    expect(t.isValid()).toEqual(false);

    t.update({
      email: 'test@example.org'
    });

    expect(t.isValid()).toEqual(true);
  });

  test('can construct a valid object with values', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});
    expect(t.getId()).toEqual("123");
    expect(t.toObject()).toEqual({name: "John", email: "test@example.org"});
  });
  
  test('validates constructor arguments against schema', () => {
    expect(() => new TestModel("123", {name: "John", email: "notanemail"})).toThrow(Yup.ValidationError);
  });
  
  test('strips unknown values', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org", foo: "bar"});
    expect(t.getId()).toEqual("123");
    expect(t.toObject()).toEqual({name: "John", email: "test@example.org"});
  });

});

describe("updating the object", () => {
  test('can update values', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});

    t.setId("321");
    t.update({
      name: "James",
      email: "james@example.org"
    });

    expect(t.getId()).toEqual("321");
    expect(t.toObject()).toEqual({name: "James", email: "james@example.org"});
  });

  test('can partially update the object', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});
    
    expect(t.getId()).toEqual("123");
    expect(t.toObject()).toEqual({name: "John", email: "test@example.org"});

    t.update({
      name: "James"
    });
    
    expect(t.getId()).toEqual("123");
    expect(t.toObject()).toEqual({name: "James", email: "test@example.org"});
  });
  
  test('validates on update', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});
    
    expect(() => t.update({ email: "invalid" })).toThrow(Yup.ValidationError);
  });

  test('ignores unknown values', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});
    
    t.setId("321");
    t.update({
      name: "James",
      foo: "bar"
    });

    expect(t.getId()).toEqual("321");
    expect(t.toObject()).toEqual({name: "James", email: "test@example.org"});
  });
});

describe("calculating paths", () => {
  test('can calculate path', () => {
    const t = new TestModel("123");
    expect(t.getPath()).toEqual("testModels/123");
  });
  
  test('cannot calculate path without id', () => {
    const t = new TestModel();
    expect(t.getPath).toThrow();
  });
  
  test('can calculate path with parent', () => {
    const t1 = new TestModel("123"),
          t2 = new TestModel("321");
    
    expect(t2.getPath(t1)).toEqual("testModels/123/testModels/321");
  });
});

describe("explicit validation", () => {
  test('validate() method', () => {
    const t = new TestModel("123");
    expect(() => t.validate()).toThrow(Yup.ValidationError);
    t.update({
      email: 'test@example.org'
    });
    expect(() => t.validate()).not.toThrow(Yup.ValidationError);
  });

  test('isValid() method', () => {
    const t = new TestModel("123");
    expect(t.isValid()).toEqual(false);
    t.update({
      email: 'test@example.org'
    });
    expect(t.isValid()).toEqual(true);
  });
});

describe("the class is a Firestore converter", () => {
  test('can convert to Firestore', () => {
    const t = new TestModel("123", {name: "John", email: "test@example.org"});
    const c = TestModel.toFirestore(t);
    expect(c).toEqual({name: "John", email: "test@example.org"});
  });
  
  test('can convert to Firestore with defaults', () => {
    const t = new TestModel("123", {email: "test@example.org"});
    const c = TestModel.toFirestore(t);
    expect(c).toEqual({name: "Anonymous", email: "test@example.org"});
  });

  test('validates on conversion to Firestore', () => {
    const t = new TestModel("123", {name: "John"});
    expect(t.isValid()).toEqual(false);
    expect(() => TestModel.toFirestore(t)).toThrow(Yup.ValidationError);
  });
  
  test('can convert from Firestore', () => {
  
    const fauxSnapshot = {
      data: (options) => ({name: "John", email: "test@example.org"}),
      id: "123"
    };
  
    const c = TestModel.fromFirestore(fauxSnapshot, {});
    
    expect(c.constructor).toEqual(TestModel);
    expect(c.getId()).toEqual("123");
    expect(c.toObject()).toEqual({name: "John", email: "test@example.org"});
  });
});



