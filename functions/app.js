const functions = require('firebase-functions');
const admin = require('firebase-admin');

// initialize firebase app
admin.initializeApp(functions.config().firebase);

exports.admin = admin;