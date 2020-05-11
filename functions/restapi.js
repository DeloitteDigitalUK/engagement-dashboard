const functions = require('firebase-functions');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

const { Roles } = require('models');

const { admin } = require('./app');
const { validateToken } = require('./utils/tokens');

const db = admin.firestore();

function stripPrefix(prefix) {
  return (req, res, next) => {
    if (req.url.indexOf(`/${prefix}/`) === 0) {
      req.url = req.url.substring(prefix.length + 1);
    }
    next();
  }
}

app.use(cors({origin: true}));
app.use(stripPrefix('api'));
app.use(cookieParser());
app.use(bodyParser.json());

app.post('/post-update', async (req, res) => {

  const token = req.body.token;
  if(!token) {
    res.status(400);
    res.send("No `token` parameter in request.");
    return;
  }

  const tokenData = await validateToken(db, token, [Roles.owner, Roles.administrator, Roles.author]);
  if(tokenData === null) {
    res.status(403);
    res.send("Invalid token.")
    return;
  }

  const { projectId, role } = tokenData;

  res.send(`Posting update to ${projectId} with role ${role}`);
});

exports.app = functions.https.onRequest(app);