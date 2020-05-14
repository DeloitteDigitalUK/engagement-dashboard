/**
 * Delete all documents in the collection at `path`
 */
exports.cleanUp = async (db, path, batchSize=400) => {
  console.log(`Deleting all documents under ${path}.`);
  
  const collection = db.collection(path);
  
  let totalRecordsDeleted = 0;
  
  // eslint-disable-next-line no-constant-condition
  while(true) {
    // eslint-disable-next-line no-await-in-loop
    const querySnapshot = await collection.limit(batchSize).get();

    console.log(`Found ${querySnapshot.size} documents.`);

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

    console.log(`Deleted ${querySnapshot.size} documents.`);
  }
};