const admin = require('firebase-admin');

const { v4: uuid4 } = require('uuid');
const { Project, Roles } = require('models');

exports.issueToken = async (auth, role, projectId) => {
  const uid = uuid4();
  return {
    uid: uid,
    token: await auth.createCustomToken(uid, { projectId, role })
  };
};

exports.findRemovedTokens = (before, after) => {
  const beforeTokens = new Set((before.tokens || []).map(t => t.uid));
  const afterTakens = new Set((after.tokens || []).map(t => t.uid));

  return new Set([...beforeTokens].filter(v => !afterTakens.has(v)));
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