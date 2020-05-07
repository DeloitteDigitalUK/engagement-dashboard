# Engagement Dashboard

Manage and display interesting information about engagements.

## Architecture

The client side uses ReactJS and is managed with
[create-react-app](https://create-react-app.dev).

The server side uses Google Firebase (Firstore, Cloud Functions,
Authentication).

## Development pre-requisites

- NodeJS (v13.12 tested)
- Firebase CLI (`npm install -g firebase-tools`)
- Install all dependencies with `npm install` in the root directory
- A Java JDK for running the firebase emulators locally

## Creating a firebase environment

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

You can also point these at the Firebase emulators if you run them. See
the `firebase emulators` commands for more details.

## Run app, tests

Once set up you can run various `npm` scripts:

* `npm start` will run the webapp locally at `http://localhost:3000`
* `npm test` will run unit tests in watch mode, automatically re-running tests
  when files are changed.
* `npm run test:run-emulators` will start the Firebase emulators, after
  which you can run `npm run test:integration` to run integration tests in
  watch mode. 
* Alternatively, `npm run ci:integration-test` will run Firestore local
  emulators and execute integration the integration tests once before shutting
  the emulators down again.
* `npm run build` will bundle the webapp into `build` for deployment.
* `npm run deploy` will build the app (as per `npm run build`) and then deploy
  it to Firebase hosting, alongside Cloud Functions (in the `functions`
  directory) and Firestore rules.

In addition, the data models live in their own package (so that they can be
shared between Firebase Cloud Functions and the web app). To run their tests:

  $ cd functions/models
  $ npm test

## Understanding the codebase

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