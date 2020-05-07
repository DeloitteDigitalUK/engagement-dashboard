# Engagement Dashboard ToDo

## Bugs


## Immediate

- [ ] Improve how updates are displayed on the project summary, e.g. group
      by type, limit number of updates for each type, etc.
- [ ] Add pagination to project updates list

- [ ] Add Cloud Function to automatically delete update sub-collection items
      when deleting project.
      - https://firebase.google.com/docs/firestore/solutions/delete-collections
      - https://stackoverflow.com/questions/51656880/delete-an-entire-collection-through-cloud-functions
      - https://www.npmjs.com/package/firestore-deleter

- [ ] Add Cloud Function to allow creating a new update. For some update types
      (e.g. team flow) this should instead find and update an existing update
      if one exists.
- [ ] Create command line client to use this API and create an update (as a
      simple tool and as an example of using the API).

- [ ] Create error boundaries around update and project renders
- [ ] Test and fix responsive UI

## Longer term

- [ ] Build integration with JIRA for extracting flow updates
- [ ] Build integration with JIRA for extracting RAID updates
- [ ] Build integration with JIRA for extracting release updates