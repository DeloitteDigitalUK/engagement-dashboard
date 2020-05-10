const functions = require('firebase-functions');
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();

const { admin } = require('./app');
const auth = admin.auth();

/**
 * Express middleware to validate ID Tokens in the Authorization HTTP header:
 * 
 *   `Authorization: Bearer <Firebase ID Token>`
 * 
 * You can also use a `__session` cookie.
 */
async function validateFirebaseIdToken(req, res, next) {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    idToken = req.cookies.__session;
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    req.user = await auth.verifyIdToken(idToken);
    next();
    return;
  } catch (error) {
    res.status(403).send('Unauthorized');
    return;
  }
}

function stripPrefix(prefix) {
  return (req, res, next) => {
    if (req.url.indexOf(`/${prefix}/`) === 0) {
      req.url = req.url.substring(prefix.length + 1);
    }
    next();
  }
}

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(stripPrefix('api'));

app.post('/post-update', (req, res) => {
  res.send(`Posting update to ${req.user.projectId} with role ${req.user.role}`);
});

exports.app = functions.https.onRequest(app);