const firebase = require('firebase');

const { nanoid } = require('nanoid');
const { Project, Roles } = require('models');

const TOKENS_COLLECTION = '_api_tokens';

exports.verifyAndGetProject = async (db, projectId, email, roles=[Roles.owner]) => {

  const snapshot = await db
    .collection(Project.getCollectionPath())
    .doc(projectId)
    // XXX: in the server cloud function, we get an error calling
    // `snapshot.data()` in the converter, so we do it manually below instead.
    // .withConverter(Project)
    .get();
  
  if(!snapshot.exists) {
    throw new Error(`Project with id ${projectId} does not exist.`)
  }

  const project = Project.fromFirestore(snapshot, {});
  
  if(!project.hasRole(email, roles)) {
    throw new Error(`User ${email} is not allowed to create tokens for project ${projectId}.`)
  }

  return project;
}

exports.issueToken = async (db, project, role, name) => {
  const uid = nanoid(32);
  const token = nanoid(64);
  const creationDate = new Date();

  // add token to the secret tokens collection
  await db.collection(TOKENS_COLLECTION).doc(token).set({
    projectId: project.id,
    role,
    uid,
    name,
    creationDate
  });
  
  // record uid, name, date against project
  const tokenData = { uid, role, name, creationDate };
  
  // this code would be cleaner with `FieldValue.arrayUnion()` but that is failing
  // with what looks like a Firebase bug :(
  const projectRef = db.doc(project.getPath());
  await db.runTransaction(async t => {
    const p = (await t.get(projectRef)).data();
    await t.update(projectRef, {
      tokens: [...p.tokens, tokenData]
    });
  });
  
  return token;
};

exports.findRemovedTokens = (before, after) => {
  const beforeTokens = (before.tokens || []).map(t => t.uid);
  const afterTakens = new Set((after.tokens || []).map(t => t.uid));
  return [...new Set([...beforeTokens].filter(v => !afterTakens.has(v)))];
};

exports.revokeTokens = async (db, uids) => {
  const querySnapshot = await db
    .collection(TOKENS_COLLECTION)
    .where('uid', 'in', uids)
    .get();
  
  const batch = db.batch();
  
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  return batch.commit();
};

exports.validateToken = async (db, token, roles) => {
  const tokenSnapshot = await db.collection(TOKENS_COLLECTION).doc(token).get();
  if(!tokenSnapshot.exists) {
    return null;
  }

  const tokenData = tokenSnapshot.data();
  if(!roles.includes(tokenData.role)) {
    return null;
  }
  
  const projectSnapshot = await db
    .collection(Project.getCollectionPath())
    // XXX: in the server cloud function, we get an error calling
    // `snapshot.data()` in the converter, so we do it manually below instead.
    // .withConverter(Project)
    .doc(tokenData.projectId)
    .get();

  if(!projectSnapshot.exists) {
    return null;
  }

  const project = Project.fromFirestore(projectSnapshot, {});

  if(!project.tokens.some(t => t.uid === tokenData.uid)) {
    return null;
  }

  return tokenData;
};