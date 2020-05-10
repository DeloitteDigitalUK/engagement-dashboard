#!/usr/bin/env node

// This command line tool serves two purposes:
//
//  1. To make it easier to push updates to remote Engagement Dashboard projects
//     using the API. You grab the remote REST API URL, the Firebase API key,
//     an access token saved from the app stored in a text file, and a file
//     containing the JSON data you want to send to the server.
//
//  2. To illustrate how to use the REST API for another integration. The basic
//     idea is that you first exchange the project API token you downloaded for
//     a temporary Firebase authentication ID token, and then you use this as
//     a "Bearer Token" by passing it to the REST API in the `Authorization:`
//     head.

const fs = require('fs');
const yargs = require('yargs');
const axios = require('axios').default;

const AUTH_API_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken';

const args = yargs
  .option('url', {
    alias: 'u',
    describe: 'URL of the API end-point',
    demandOption: true,
    requiresArg: true,
  })
  .option('api-key', {
    alias: 'a',
    describe: 'Firebase API key',
    demandOption: true,
    requiresArg: true,
  })
  .option('token-file', {
    alias: 't',
    describe: 'File containing the Project API token',
    demandOption: true,
    requiresArg: true,
    normalize: true,
  })
  .option('data-file', {
    alias: 'd',
    describe: 'File containing data to send in JSON format',
    demandOption: true,
    requiresArg: true,
    normalize: true,
  })
  .argv;

// Authenticate using the Google Identity Toolkit API. It would be even easier
// to use the Firebase client SDK (`auth.signInWithToken()`), but this
// demonstrates a purely REST-based approach better

async function logIn(apiKey, token) {

  // POST to https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=<API_KEY>
  // With: Content-Type: application/json
  // With: `token` and `returnSecureToken: true` sent in the request body (JSON encoded).
  
  const response = await axios.post(AUTH_API_URL, {
    token: token,
    returnSecureToken: true,
  }, {
    params: {
      key: apiKey
    }
  });
  
  return response.data.idToken;
}

async function callAPI(url, idToken, data) {

  // Call API URL with headers:
  //
  //  Content-Type: application/json
  //  Authorization: Bearer <idtoken>
  
  const response = await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  return response.data;
}

async function main(url, apiKey, tokenFile, dataFile) {
  if(!fs.existsSync(tokenFile)) {
    console.error(`Token file '${tokenFile}' does not exist.`);
    return;
  }
  
  if(!fs.existsSync(dataFile)) {
    console.error(`Data file '${dataFile}' does not exist.`);
    return;
  }

  const token = fs.readFileSync(tokenFile).toString();
  let data = fs.readFileSync(dataFile, 'utf8')
  
  try {
    data = JSON.parse(data);
  } catch(e) {
    console.error(`Unable to parse data file '${dataFile}' as JSON: ${e.message}`);
    return;
  }

  
  console.log("Attempting to log in")
  let idToken = null;
  try {
    idToken = await logIn(apiKey, token);
  } catch (e) {
    console.error(`Login failed with status ${e.response.status} ${e.response.statusText}`)
    console.error(e.response.data);
    return;
  }

  console.log("Calling API")
  let response = null;
  try {
    response = await callAPI(url, idToken, data);
  } catch (e) {
    console.error(`API call failed with status ${e.response.status}: ${e.response.statusText}`)
    console.error(e.request);
    console.error(e.response.data);
    return;
  }

  console.log("Complete. API returned");
  console.log();
  console.log(response);
  console.log();

  console.log("Done")
}

main(args['url'], args['api-key'], args['token-file'], args['data-file']);