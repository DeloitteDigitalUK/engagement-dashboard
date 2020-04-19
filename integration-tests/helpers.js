const firebase = require('@firebase/testing');
const fs = require('fs');

/**
 * Set up mock app. `auth` can be an object like `{uid: "123"}` to simulate
 * authentication. `data` is used to set up some mock data ahead of time:
 * 
 * ```
 * data={
 *   'collection123/doc123': {
 *     foo: 'bar'
 *   },
 *   'collection123/doc321': {
 *     foo: 'baz'
 *   }
 * }
 * ```
 */
module.exports.setup = async (auth=null, data=null, rulesFile='firestore.rules') => {

  const projectId = `rules-spec-${Date.now()}`;
  const app = firebase.initializeTestApp({
    projectId,
    auth
  });

  const db = app.firestore();

  // Write mock documents before rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  // Load rules
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(rulesFile, 'utf8')
  });

  return db;
};

/**
 * Delete all apps and their data in the test database.
 */
module.exports.tearDown = async () => {
  Promise.all(firebase.apps().map(app => app.delete()));
};

/**
 * Custom Jest matchers to confirm access alowed/denied according to Firestore
 * rules.
 */
expect.extend({

  async toBeAllowed(x) {
    try {
      await firebase.assertSucceeds(x);
      return {
        pass: true,
        message: () => 'Expected Firebase operation to be allowed, but it was denied'
      };
    } catch (err) {

    }

    
  },

  async toBeDenied(x) {
    try {
      await firebase.assertFails(x);
    } catch (err) {
      return {
        pass: false,
        message: () => 'Expected Firebase operation to be denied, but it was allowed'
      };
    }
  }

});