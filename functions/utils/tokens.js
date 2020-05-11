const { nanoid } = require('nanoid');
const { Project, Roles } = require('models');

const TOKENS_COLLECTION = '_api_tokens';

exports.issueToken = async (db, role, projectId, name) => {
  const uid = nanoid(32);
  const token = nanoid(64);
  await db.collection(TOKENS_COLLECTION).doc(token).set({ projectId, role, uid, name });
  return { uid, token };
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
}

exports.findRemovedTokens = (before, after) => {
  const beforeTokens = (before.tokens || []).map(t => t.uid);
  const afterTakens = new Set((after.tokens || []).map(t => t.uid));
  return [...new Set([...beforeTokens].filter(v => !afterTakens.has(v)))];
};

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

exports.addTokenToProject = async (db, project, uid, role, name) => {
  const tokenData = { uid, role, name, creationDate: new Date()};
  project.tokens.push(tokenData);
  return db.doc(project.getPath()).update({
    tokens: project.tokens
  });
};