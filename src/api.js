import * as firebase from 'firebase/app';

// These imports have side-effects!
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import * as Yup from 'yup';
import * as rfhAuth from 'react-firebase-hooks/auth';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';

import { createContext, useContext } from 'react';

import { Project, Update, Roles } from 'models';

// To configure these, set them in a `.env` or `.env.local` file.

var firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialise Firebase global singleton

firebase.initializeApp(firebaseConfig);

// to get trace debugging for Firestore operations, uncomment this line
// firebase.setLogLevel('debug');

// Expose variants of  `react-firebase-hooks` hooks configured to use this firebase instance
export const useAuthState = () => rfhAuth.useAuthState(firebase.auth());

/**
 * Basic API for the app. Usually accessed via a hook:
 * 
 *  const api = useAPI()
 * 
 * Does not attempt to fully abstract Firebase, but rather to provide better
 * isolated functions to avoid scattering too much logic in the UI code.
 */
export default class API {

  constructor() {
    this.firebase = firebase;
  }

  // Authentication API

  /**
   * Log in and return credentials
   * May legitimately throw with `error.code` set to one of:
   *   - "auth/invalid-email"
   *   - "auth/user-disabled"
   *   - "auth/user-not-found"
   *   - "auth/wrong-password"
   */
  async logIn(email, password) {
    return this.firebase.auth().signInWithEmailAndPassword(email, password);
  }

  /**
   * Log out current user
   */
  async logOut(){
    return this.firebase.auth().signOut();
  }
  
  /**
   * Create and return user. User will be sent a generic email verification link.
   * May legitimately throw with `error.code` set to one of
   *   - "auth/email-already-in-use"
   *   - "auth/weak-password"
   */
  async signUp(name, email, password) {
    const credentials = await this.firebase.auth().createUserWithEmailAndPassword(email, password);

    await credentials.user.updateProfile(({
      displayName: name
    }));

    await credentials.user.sendEmailVerification();

    return credentials.user;
  }

  /**
   * Send email to reset password, using a generic form.
   * May legitimately throw with `error.code` set to one of:
   *   - "auth/user-not-found"
   */
  async sendPasswordResetEmail(email) {
    return this.firebase.auth().sendPasswordResetEmail(email, {})
  }

  /**
   * Update user profile data.
   */
  async updateProfile({ name }) {
    const user = this.firebase.auth().currentUser;
    return user.updateProfile({
      displayName: name
    })
  }

  /**
   * Change password from old (which will be re-authenticated) to new.
   * May legitimately throw with `error.code` set to:
   *   - "auth/wrong-password"
   *   - "auth/weak-password"
   */
  async changePassword(oldPassword, newPassword) {
    const user = this.firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
    await user.reauthenticateWithCredential(credential);
    return user.updatePassword(newPassword);
  }

  // Project CRUD

  /**
   * Create a new project in the data store.
   */
  async addProject(user, project) {

    if(!project.hasRole(user.email, Roles.owner)) {
      throw new Yup.ValidationError("Current user is not set as the owner", project.roles, "roles", 'check-ownership');
    }

    const doc = await this.firebase.firestore()
      .collection(Project.getCollectionPath())
      .withConverter(Project)
      .add(project);

    project.id = doc.id;
  }

  /**
   * Save changes to the given project. The server will enforce that only an
   * owner or administrator can make changes.
   */
  async saveProject(project) {
    return this.firebase.firestore()
      .doc(project.getPath())
      .withConverter(Project)
      .set(project);
  }

  /**
   * Delete the given project. The server will enforce that only the owner
   * can do this.
   */
  async deleteProject(project) {
    return this.firebase.firestore()
      .doc(project.getPath())
      .delete();
  }

  /**
   * Return a hook with a `[project, loading, error]` triple.
   */
  useProject(projectId) {
    const [ doc, loading, error ] = useDocument(
      this.firebase.firestore()
        .collection(Project.getCollectionPath())
        .withConverter(Project)
        .doc(projectId)
    );

    const project = doc? doc.data() : null;
    return [project, loading, error];
  }

  /**
   * Return a hook with a `[projects, loading, error]` triple
   * for all projects accessible to this user.
   */
  useProjects(user) {
    const [ query, loading, error ] = useCollection(
      this.firebase.firestore()
        .collection(Project.getCollectionPath())
        .withConverter(Project)
        .where(`roles.${Project.encodeKey(user.email)}`, 'in', [
          Roles.owner,
          Roles.administrator,
          Roles.author,
          Roles.member
        ])
    );

    if(loading || error) {
      return [ null, loading, error ];
    }

    // we sort manually because if we add an `orderBy()` clause to the query,
    // firestore requires is to have a composite index for each combination of
    // email address (in `roles`) in the `name` attribute, which are not
    // automatically added. The number of projects should be small anyway.
    let projects = query.docs.map(p => p.data()).sort((a, b) => ('' + a.name).localeCompare(b.name));

    return [projects, loading, error];
  }

  // Update CRUD

  /**
   * Create a new update in the data store.
   */
  async addUpdate(update) {
    if(!update.parent) {
      throw new Yup.ValidationError("Update does not have a parent", update.id, "parent", 'check-parent');
    }

    const doc = await this.firebase.firestore()
      .collection(Update.getCollectionPath(update.parent))
      .withConverter(Update)
      .add(update);

    update.id = doc.id;
  }

  /**
   * Save changes to the given update. The server will enforce that only an
   * author, owner or administrator can make changes.
   */
  async saveUpdate(update) {
    if(!update.parent) {
      throw new Yup.ValidationError("Update does not have a parent", update.id, "parent", 'check-parent');
    }

    return this.firebase.firestore()
      .doc(update.getPath())
      .withConverter(Update)
      .set(update);
  }

  /**
   * Delete the given update. The server will enforce that only an author, owner
   * or administrator can do this.
   */
  async deleteUpdate(update) {
    if(!update.parent) {
      throw new Yup.ValidationError("Update does not have a parent", update.id, "parent", 'check-parent');
    }

    return this.firebase.firestore()
      .doc(update.getPath())
      .delete();
  }


  /**
   * Return a hook with a `[update, loading, error]` triple.
   */
  useUpdate(project, updateId) {
    const [ doc, loading, error ] = useDocument(
      this.firebase.firestore()
        .collection(Update.getCollectionPath(project))
        .withConverter(Update)
        .doc(updateId)
    );
    
    let update = null;
    if(doc) {
      update = doc.data();
      if(!update) {
        return [null, loading, error];
      }
      
      update.parent = project;
    }

    return [update, loading, error];
  }

  /**
   * Return a hook with a `[updates, loading, error]` triple
   * for all updates under this project matching the criteria
   */
  useUpdates(project, team=null, updateType=null, limit=null) {
    let query = this.firebase.firestore()
      .collection(Update.getCollectionPath(project))
      .withConverter(Update)
      .orderBy('date', 'desc');
    
    if(team) {
      query = query.where('team', '==', team);
    }

    if(updateType) {
      query = query.where('type', '==', updateType);
    }

    if(limit) {
      query = query.limit(limit)
    }

    const [ querySnapshot, loading, error ] = useCollection(query);

    if(loading || error) {
      return [ null, loading, error ];
    }

    const updates = querySnapshot.docs.map(u => { let n = u.data(); n.parent = project; return n; });
    return [updates, loading, error];
  }

  // Tokens

  /**
   * Create a new API token for the given projec with the given name.
   * Return the token.
   */
  async createToken(project, name) {
    const remote = firebase.functions().httpsCallable('tokens-createNew');
    const response = await remote({ projectId: project.id, name });
    return response.data;
  }

  /**
   * Remove the API token with the given uid from the project.
   */
  async removeToken(project, uid) {
    project.tokens = (project.tokens || []).filter(t => t.uid !== uid);
    return this.firebase.firestore()
      .doc(project.getPath())
      .withConverter(Project)
      .update({
        tokens: project.tokens
      });
  }
  
}

/**
 * Provide an instance of `API` as React context. Use `useAPI()` as a convience hook.
 */
export const APIContext = createContext(new API());
export const useAPI = () => useContext(APIContext);