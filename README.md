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
  which you can run `npm run test:integration` to run integratoin tests in
  watch mode. 
* Alternatively, `npm run ci:integration-test` will run Firestore local
  emulators and execute integration the integration tests once before shutting
  the emulators down again.
* `npm run build` will bundle the webapp into `build` for deployment.
* `npm run deploy` will build the app (as per `npm run build`) and then deploy
  it to Firebase hosting, alongside Cloud Functions (in the `functions`
  directory) and Firestore rules.
