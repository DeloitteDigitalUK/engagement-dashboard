const functions = require('firebase-functions');

const { Roles } = require('models');

const { admin } = require('./app');
const {
  issueToken,
  revokeTokens,
  findRemovedTokens,
  verifyAndGetProject
} = require('./utils/tokens');

const db = admin.firestore();

/**
 * Generate a token which can be used to log in and then access the API
 */
exports.createNew = functions.https.onCall(async (data, context) => {
  if(!data.projectId) {
    throw new functions.https.HttpsError('invalid-argument', "No `projectId` parameter supplied.");
  }

  if(!data.name) {
    throw new functions.https.HttpsError('invalid-argument', "No `name` parameter supplied.");
  }

  if(!context.auth || !context.auth.token) {
    throw new functions.https.HttpsError('permission-denied', "User is not logged in.");
  }
  
  const email = context.auth.token.email;
  if(!email) {
    throw new functions.https.HttpsError('permission-denied', "Current user does not have an email address.");
  }

  // In future we may want to allow different roles, but for now default to `author
  const role = Roles.author;

  const project = await verifyAndGetProject(db, data.projectId, email);
  return await issueToken(db, project, role, data.name);
});

/**
 * Remove users tied to tokens when no longer in use
 */
exports.removeUnusedTokens = functions.firestore
  .document('projects/{projectId}')
  .onUpdate(async (change, context) => {
    const removed = findRemovedTokens(change.before.data(), change.after.data());
    return removed.length > 0? revokeTokens(db, removed) : null;
  });
