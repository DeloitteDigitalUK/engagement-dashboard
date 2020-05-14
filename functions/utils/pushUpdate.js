const Yup = require('yup');
const { Project, Update } = require('models');

const PushOperation = {
  update: 'updated',
  add: 'added'
};

exports.PushOperation = PushOperation;

exports.pushUpdate = async (db, projectId, updateData, alwaysCreate=false) => {

  // Find project
  const projectSnapshot = await db
    .collection(Project.getCollectionPath())
    .doc(projectId)
    .get();
  
  if(!projectSnapshot.exists) {
    // should (hardly) never happen - token validation checks project
    throw new Error(`Project with id ${projectId} not found.`)
  }

  const project = Project.fromFirestore(projectSnapshot, {});

  // Validate update type
  if(!updateData.type) {
    throw new Yup.ValidationError("Update data must contain a `type` key.");
  }

  if(!project.updateTypes.includes(updateData.type)) {
    throw new Yup.ValidationError(`Update type '${updateData.type}' is not enabled for project ${projectId}.`);
  }

  // Look up update type and construct a valid update object
  const UpdateType = Update.typeRegister[updateData.type];
  if(!UpdateType) {
    throw new Yup.ValidationError(`Update type '${updateData.type}' not recognised.`);
  }

  // If appropriate, look for an existing update to, ahem, update
  const updateKey = UpdateType.getUpdateKey(updateData);
  if(!alwaysCreate && updateKey && updateKey in updateData) {
    let docSnapshot = null;
    const updateKeyValue = updateData[updateKey];

    // if an `id` was provided make sure we are actually able to update one
    // specific object
    if(updateKey === 'id') {
      docSnapshot = await db
        .collection(UpdateType.getCollectionPath(project))
        .doc(updateKeyValue)
        .get();
      
      if(!docSnapshot.exists) {
        throw new Yup.ValidationError(`Update with id '${updateKeyValue}' not found for project ${projectId}.`);
      }

    } else {
      const existingUpdateQuery = await db
        .collection(UpdateType.getCollectionPath(project))
        .where(updateKey, '==', updateKeyValue)
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      docSnapshot = !existingUpdateQuery.empty? existingUpdateQuery.docs[0] : null;
    }

    if(docSnapshot && docSnapshot.exists) {
      const update = UpdateType.fromFirestore(docSnapshot, {});
      update.parent = project;
      update.update(updateData)  // may throw validation error

      await db
        .doc(update.getPath())
        .withConverter(UpdateType)
        .set(update);
      
      return PushOperation.update;
    }
  }

  // Otherwise, create a new one and ensure we have a fully valid object
  const update = new UpdateType(null, updateData, project);
  update.validate();  // may throw validation error
  
  await db
    .collection(UpdateType.getCollectionPath(project))
    .withConverter(UpdateType)
    .add(update);

  return PushOperation.add;
};