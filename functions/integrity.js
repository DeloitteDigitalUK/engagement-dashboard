const functions = require('firebase-functions');

const { admin } = require('./app');
const { cleanUp } = require('./utils/cleanup');

const db = admin.firestore();

exports.cleanUpUpdates = functions.firestore
  .document('projects/{projectId}')
  .onDelete(async (snap, context) => cleanUp(db, `/projects/${context.params.projectId}/updates`));
