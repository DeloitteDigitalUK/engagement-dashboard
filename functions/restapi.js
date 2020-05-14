const functions = require('firebase-functions');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler')

const Yup = require('yup');

const { Roles } = require('models');

const { admin } = require('./app');
const { validateToken } = require('./utils/tokens');
const { pushUpdate } = require('./utils/pushUpdate');

function stripPrefix(prefix) {
  return (req, res, next) => {
    if (req.url.indexOf(`/${prefix}/`) === 0) {
      req.url = req.url.substring(prefix.length + 1);
    }
    next();
  }
}

const app = express();
app.use(cors({origin: true}));
app.use(stripPrefix('api'));
app.use(cookieParser());
app.use(bodyParser.json());

const db = admin.firestore();

app.post('/post-update', asyncHandler(async (req, res) => {

  const token = req.body.token;
  const updateData = req.body.updateData;
  const alwaysCreate = req.body.alwaysCreate || false;

  if(!token) {
    res
      .status(400)
      .send("No `token` parameter in request.");
    return;
  }

  if(!updateData) {
    res
      .status(400)
      .send("No `updateData` parameter in request.");
    return;
  }

  const tokenData = await validateToken(db, token, [Roles.owner, Roles.administrator, Roles.author]);
  if(tokenData === null) {
    res
      .status(403)
      .send("Invalid token.");
    return;
  }

  const { projectId } = tokenData;

  try {
    const operation = await pushUpdate(db, projectId, updateData, alwaysCreate);
    res.send(`An update was ${operation}.`);
    return;
  } catch(e) {
    if(e instanceof Yup.ValidationError) {
      res
        .status(400)
        .send(e.message);
      return;
    }

    res
      .status(500)
      .send(e.message);
    return;
  }
}));

exports.app = functions.https.onRequest(app);