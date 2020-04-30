# Engagement Dashboard ToDo

## Immediate

- [ ] Test and fix responsive UI

- [ ] Create views for Flow updates
- [ ] Create views for Goals updates
- [ ] Create views for RAID updates
- [ ] Create views for Release updates

- [ ] Improve how updates are displayed on the project summary, e.g. group
      by type, limit number of updates for each type, etc.

- [ ] Add Cloud Function to automatically delete update sub-collection items
      when deleting project.

- [ ] Add Cloud Function to allow creating a new update. For some update types
      (e.g. team flow) this should instead find and update an existing update
      if one exists.
- [ ] Create command line client to use this API and create an update (as a
      simple tool and as an example of using the API).


## Longer term

- [ ] Build integration with JIRA for extracting flow updates
- [ ] Build integration with JIRA for extracting RAID updates
- [ ] Build integration with JIRA for extracting release updates