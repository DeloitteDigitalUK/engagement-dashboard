# Engagement Dashboard ToDo

## Bugs


## Immediate

- [ ] Improve how updates are displayed on the project summary, e.g. group
      by type, limit number of updates for each type, etc.
- [ ] Add pagination to project updates list

- [ ] Add Cloud Function to allow creating a new update. For some update types
      (e.g. team flow) this should instead find and update an existing update
      if one exists.

      - [X] Tokens list held against projects (UID, name, date, role)
      - [X] New page to manage tokens (view/add/remove)
      - [X] When adding token, call a cloud function to create a "custom token",
            with claims over the project ID and the role, with a generated UID.
            Return actual token, but only show once, do not store.
      - [X] Cloud function (triggered) to listen for updates to projects and
            remove token users/tokens as required.
      - [ ] Cloud function (REST) to process new/modified updates, checks for
            valid token, then checks claim to get project id, role

- [ ] Create command line client to use this API and create an update (as a
      simple tool and as an example of using the API).

      - [ ] Log in via Firebase client-side SDK (REST also possible)
      - [ ] Call REST API

- [ ] Create error boundaries around update and project renders
- [ ] Test and fix responsive UI

## Longer term

- [ ] Build integration with JIRA for extracting flow updates
- [ ] Build integration with JIRA for extracting RAID updates
- [ ] Build integration with JIRA for extracting release updates