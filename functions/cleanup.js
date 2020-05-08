const functions = require('firebase-functions');

const { admin } = require('./app');
const { Project, Update } = require('models');

const BATCH_SIZE = 400;

exports.cleanUpUpdates = functions.firestore
.document('projects/{projectId}')
.onDelete(async (snap, context) => {
  
  const db = admin.firestore();
  const path = `${Project.getCollectionPath()}/${context.params.projectId}/${Update.getCollectionPath()}`;
  
  console.log(`Project ${context.params.projectId} was deleted. Deleting all updates under ${path}.`);
  
  const collection = db.collection(path);
  
  let totalRecordsDeleted = 0;
  
  // eslint-disable-next-line no-constant-condition
  while(true) {
    // eslint-disable-next-line no-await-in-loop
    const querySnapshot = await collection.limit(BATCH_SIZE).get();

    console.log(`Found ${querySnapshot.size} document`);

    if(querySnapshot.size === 0) {
      return totalRecordsDeleted;
    }

    totalRecordsDeleted += querySnapshot.size;

    const batch = db.batch();
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // eslint-disable-next-line no-await-in-loop
    await batch.commit();

    console.log(`Deleted ${querySnapshot.size} documents`);
  }
  
});