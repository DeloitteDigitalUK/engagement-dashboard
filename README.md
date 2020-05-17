# Engagement Dashboard

Manage and display interesting information about engagements.

Users can sign up and then log in, after which they can create *projects*.
Projects can be shared with other users via their email addresses, with a
simple role-based permission system.

Projects are containers for *updates* of various types. Updates can be added
via the web UI or through an integration with a third party system. Update
types include:

- Information about a *release*.
- New *insights*.
- *Goals* for teams.
- Important *RAID items*: risks, issues, dependencies, decisions, etc.
- *Flow data* that can be used to render pretty graphs.

Updates contain some common data - a title, a description, a date - and some
information specific to the update type.

## REST API

Updates can be added via a simple RESTful API, secured with unique tokens. A
project owner can generate one or more *tokens*, which should be kept as secret
as possible. A `POST` request can then be sent to the endpoint URL, which will
(depending on the hosting) be:

  `https://{domain}/api/post-update`

The request must have a `Content-Type` of `application/json` and contain a JSON
object in its payload. This object should have the following keys:

- `token` – The unique project token. This serves both to authenticate the
  request, and to identify the project to update.
- `updateData` – An object containing the data needed to create or modify an
  update – more on this below.
- `alwaysCreate` (optional) – Always create a new update, rather than modifying
  an existing one, even if the data in `updateData` would normally imply
  updating one.

The update data is specific to the update type, but all include certain fields:

```
  "token": <token string, required>,
  "updateData": {
    "type": <string, required>,
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>
    ...
  }
```

(Note: To encode a string, use a JavaScript-style ISO date string, e.g.
`"date": "2020-01-02T00:00:00.000Z"`).

Depending on the `type`, other fields are required:

Insights:
```
  "updateData": {
    "type": "insights",
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>,
    "authorId": <string, required>,
    "authorName": <string, required>,
    "text": <string of markdown-formatted text, required>
  }
```

Goals:
```
  "updateData": {
    "type": "goals",
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>,
    "authorId": <string, required>,
    "authorName": <string, required>,
    "text": <string of markdown-formatted text, required>
  }
```

Release:
```
  "updateData": {
    "type": "release",
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>,
    "releaseDate": <date, optional>,
    "status": <string, one of: 'in-progress', 'complete', 'overdue'>
    "text": <string of markdown-formatted text, required>
  }
```

RAID update:
```
  "updateData": {
    "type": "raid",
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>,
    "raidItems": [{
      "type": <string, one of: 'risk', 'issue', 'assumption', 'dependency', 'decision'>,
      "summary": <string, required>,
      "url": <string, optional, must be a valid URL>,
      "priority": <string, one of: 'low', 'medium', 'high'>,
      "date": <date, optional>
    }]
  }
```

Flow:
```
  "updateData": {
    "type": "flow",
    "title": <string, required>,
    "summary": <string, optional>,
    "date": <date, required>,
    "team": <string, optional>,
    "cycleTimeData": [{
      "item": <string, required>,
      "commitmentDate": <date, required>,
      "completionDate": <date, optional>,
      "itemType": <string, optional>,
      "url": <string, optional, must be a valid URL>
    }]
  }
```

In all cases, you can also add an `"id"` parameter to refer to a specific
update (the ID is visible in the URL in the web app), in which case this will
be modified.

Specifically for the *flow* update type, the default behaviour is to modify
another flow update for the same *team*, i.e. matching on the `"team"` field.

To avoid this behaviour, send `"alwaysCreate": true` in the API payload.

## Command-line client

You can also use the API via a simple command-line tool. This also serves as
a simple example of how to call the API. It can be found in the `cli/` folder,
which is its own NPM package. To install the tool:

```
$ cd cli
$ npm install -g
```

This should install a utility called `engagement-dashbaord`:

```
$ engagement-dashboard --help
```

The basic usage pattern is:

```
$ engagement-pattern --url <API endpoint URL> --token-file token.txt --data-file data.json
```

The `--token-file` parameter specifies a text file that contains the token (we
do it this way because it is easier to secure a file than a command line
parameter, which might be replicated in shell history etc.).

The `--data-file` parameter specifies a JSON-formatted text file that contains
the update payload (i.e. the contents of the `"updateData"` parameter).

## Architecture and development

The client side uses ReactJS and is managed with
[create-react-app](https://create-react-app.dev).

The server side uses Google Firebase (Firstore, Cloud Functions,
Authentication).

### Development pre-requisites

- NodeJS (v13.12 tested)
- Firebase CLI (`npm install -g firebase-tools`)
- Install all dependencies with `npm install` in the root directory
- A Java JDK for running the firebase emulators locally

### Creating a firebase environment

The remote Firebase project and associates access keys are deliberately not
checked into source control.

A new environment can be created in the Firebase web console, and should have
the following enabled:

- Cloud Firestore
- Email-based authentication
- Hosting
- A web app

You can also use the firebase CLI to create these, but note that the generated
configuration in `firebase.json` *is* under source control. The `.firebaserc`
file that references the remote project is not, however. It should be in the
root of the repository and contain something like:

```
{
  "projects": {
    "default": "<project-id>"
  }
}
```

Additionally, you need to configure a number of environment variables for the
React compiler to be able to interpolate variables that will allow the Firebase 
JavaScript client to connect to the server. To set these up, create a file
called `.env.local` in the root of the repository with:

```
REACT_APP_API_KEY=<api-key>
REACT_APP_AUTH_DOMAIN=<domain>.firebaseapp.com
REACT_APP_DATABASE_URL=https://<app>.firebaseio.com
REACT_APP_PROJECT_ID=<app>
REACT_APP_STORAGE_BUCKET=<app>.appspot.com
REACT_APP_MESSAGING_SENDER_ID=<id>
REACT_APP_APP_ID=<id>
```
The relevant values can all be found in the Firebase web console.

You can also point the local app at the Firebase emulators if you run them. This
requires two additional environment variables (in the `.env.local` file or in
the terminal environment used to launch the webapp with `npm start`):

```
REACT_APP_EMULATE_FIRESTORE=localhost:8080
REACT_APP_EMULATE_FUNCTIONS=http://localhost:5001
```

The emulators must be started before the webapp with:

  $ firebase emulators:start

(or if you prefer: `npm run emulators`)

### Run app, tests

Various `npm` scripts can be used to start the app for local development and
testing, as well as to deploy it to Firebase.

To run the app locally (connecting to a *remote* Firebase project as per the
configured environment):

* `npm start` will run the webapp locally at `http://localhost:3000`

To run tests in interactive "watch" mode:

* `npm test` will run unit tests in watch mode, automatically re-running tests
  when files are changed.
* `npm run test:models` will run unit test the shared models package in
  watch mode.
* `npm run emulators` will start the Firebase emulators, after
  which you can run:
* `npm run test:integration` to run integration tests in watch mode.

To run the tests once:

* `npm run test:ci:all` will run all of the below in sequence:
* `npm run test:ci` for the front-end tests.
* `npm run test:ci:models` for the models unit tests.
* `npm run test:ci:integration` for the integration tests *including starting
   the emulators* (this will fail if the emulators are already running!)

To build and deploy to production:

* `npm run build` will bundle the webapp into `build` for deployment.
* `npm run deploy` will build the app (calling `npm run build`) and then deploy
  it to Firebase hosting, alongside Cloud Functions (in the `functions`
  directory) and Firestore rules. To deploy functions only, run
  `npm run deploy` from the `functions` directory.

### Understanding the codebase

The code is organised as follows:

 * `firebase.json` configures the Firebase command line client and signposts
   which parts of Firebase are in use.
 * `firestore.rules` and `firestore.indexes.json` configure the Firestore
   database. The rules use a DSL (see the Firebase documentation) to determine
   what is and isn't allowed by the client API. In part, this helps define the
   "shape" of the data that is allowed (although the data store is schema-less
   so this is imperfect) and in part it enforces all the security rules about
   who can read and write what data.
 * `public/` contains static HTML assets which are bundled into the client-side
   app build. Notably the mostly-empty `index.html` page where the React
   component tree is mounted.
 * `src/` contains the client-side React webapp. When built, it can be served
   as static HTML. Connecetions to the backend are made using the Firebase
   Javascript client. The webapp consists of:

   * `api.js`, which contains a singleton class that performs all the Firebase
      backend operations. React components that need access to the backend
      call `useAPI()` to get a handle to this API and then call its various
      functions.
   * `App.jsx`, the root of the application, which initiates client-side page
     routing (using `react-router-dom`).
   * `pages/`,  which contains React components that represent pages in the
     application. Pages are mounted using `react-router` from `App.jsx`.
   * `layouts/`, wherein there are layout components for anonymous and
     authenticated users – common UI such as the toolbar that pages wrap
     themselves in.
   * `components/`, which contains smaller, reusable React components.
   * `components/updates/`, wherein live the various views (summary tile,
      full-page view, add/edit form) for each of the update types. These all
      export an object that is imported in `components/updates/index.js`
      and used in a registry of update type views keyed by an update type string
      stored in the database (more on this below).
   * `utils/` contains shared utility code.
* `functions/` contains Firebase Cloud Functions. It is a self-contained NPM
  package and uses slightly different (more basic, less cutting-edge)
  transpilation and linting settings from the React app. This can be confusing,
  so try to keep code in Cloud Functions simple and avoid using experimental
  JavaScript features.
* `functions/models` is a separate NPM package that contains some classes that
  define the data model for the application. It has minimal dependencies and
  deliberately does not use any Firebase-specific libraries. This allows it to
  be shared by the client and Cloud Functions. It also has its own test suite.
  (It lives under `functions/` because of the way Firebase deployment works.)
* `integration-tests/` contains a set of tests that depend in the Firebase
  emulator suite running. Since they site outside the webapp, these too are only
  allowed to use a more basic set of JavaScript features, so keep them simple.

As an example that threads through all of these moving parts, let's consider
how we would change the fields of one of the update types in the data model,
the database, the tests, and the UI:

 * First, find the relevant update type in `functions/models/*.js`, e.g.
   `releaseUpdate.js`. This defines a validation schema (using the `Yup`
   library), declares class that derives from `Update` (which in turn derives
   from `Base`) that provides various methods for constructing and serialising
   an instance of the model, and registers itself with the update registry. To
   add a new field, we need to modify the `Yup` schema.
 * This will likely break the tests in `models/releaseUpdate.test.js`, so these
   will need to be run (`npm test` from within the `models` directory) and
   adjusted as necessary.
 * Next, the integration tests will likely (hopefully!) break, because the
   default object shape no longer conforms to the shape expected in the
   Firestore rules. These live in `firetore.rules`. It is possible to modify
   and test these using the Firebase web console, but the safest way is to
   run the integration tests (run `npm run test:run-emulators` once from the
   root of the repository, then `npm run test:integration` in a separate
   terminal). The Firestore emulator automatically watch for changes to the
   `firestore.rules` file, so changes can be made and tested in real time.
   The test for the Release update type are in
   `integration-tests/releaseUpdate.test.js`. Once you have modified the rules,
   they can be deployed to the backend by running
   `firebase deploy --only firestore:rules`.
 * Next, you will likely want to modify the add/edit form for this update type,
   and possibly the summary and full-page view as well. These all live in
   `src/components/update/release.jsx`. The form uses the `formik` library
   (and the `formik-material-ui` UI bindings) to handle validation and other
   details, and Material UI components to render the content.