const Update = require('./update');
const UpdateTypes = require('./updateTypes');
const Yup = require('yup');

const testSchema = Update.getSchema().concat(Yup.object({
  foo: Yup.string().required().default("")
}));

class TestUpdate extends Update {
  static getSchema() { return testSchema; }
}

Update.registerUpdateType(UpdateTypes._test, TestUpdate);

test('sets type automatically', () => {
  const t = new TestUpdate();
  
  expect(t.toObject()).toEqual({
    type: UpdateTypes._test,
    title: "",
    summary: "",
    date: null,
    team: null,
    foo: ""
  });
});

test('checks type on update', () => {
  const t = new TestUpdate(null, {
    title: "Test",
    summary: "",
    date: new Date(2020, 1, 1),
    team: null,
    foo: "bar"
  });

  expect(t.isValid()).toEqual(true);

  expect(() => t.update({type: UpdateTypes.insights})).toThrow();
  expect(t.toObject()).toEqual({
    type: UpdateTypes._test,
    title: "Test",
    summary: "",
    date: new Date(2020, 1, 1),
    team: null,
    foo: "bar"
  });

  expect(() => t.update({type: UpdateTypes._test})).not.toThrow();
  expect(t.toObject()).toEqual({
    type: UpdateTypes._test,
    title: "Test",
    summary: "",
    date: new Date(2020, 1, 1),
    team: null,
    foo: "bar"
  });

});

test('can convert from Firestore with correct class', () => {

  // simulate Firestore timestamp
  class FauxTimestamp {
    toDate() {
      return new Date(2020, 1, 1);
    }  
  }

  const fauxSnapshot = {
    data: (options) => ({
      type: UpdateTypes._test,
      title: "Test",
      summary: "",
      date: new FauxTimestamp(),
      team: null,
      foo: "bar"
    }),
    id: "123"
  };

  const c = Update.fromFirestore(fauxSnapshot, {});
  
  expect(c.constructor).toEqual(TestUpdate);
  expect(c.id).toEqual("123");
  expect(c.toObject()).toEqual({
    type: UpdateTypes._test,
      title: "Test",
      summary: "",
      date: new Date(2020, 1, 1),
      team: null,
      foo: "bar"
  });
});