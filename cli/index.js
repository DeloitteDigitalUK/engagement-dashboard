#!/usr/bin/env node

// This command line tool serves two purposes:
//
//  1. To make it easier to push updates to remote Engagement Dashboard projects
//     using the API. You supply an access token saved from the app stored in a
//     text file, and a file containing the JSON data you want to send to the
//     server.
//
//  2. To illustrate how to use the REST API for another integration.

const fs = require('fs');
const yargs = require('yargs');
const axios = require('axios').default;

const args = yargs
  // If/when we host the app on "official" URL we could default this
  .option('url', {
    alias: 'u',
    describe: 'URL of the API end-point',
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
  .option('always-create', {
    alias: 'c',
    describe: 'If set, never update an existing update',
    boolean: true,
    normalize: true,
  })
  .option('data-file', {
    alias: 'd',
    describe: 'File containing update data to send in JSON format',
    demandOption: true,
    requiresArg: true,
    normalize: true,
  })
  .argv;

async function callAPI(url, token, alwaysCreate, data) {
  const response = await axios.post(url, {
    token: token,
    alwaysCreate: !!alwaysCreate,
    updateData: data,
  });

  return response.data;
}

async function main(url, tokenFile, alwaysCreate, dataFile) {
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

  if(!data.type) {
    console.error("The update data should contain a `type` key.");
    return;
  }

  console.log("Calling API")
  let response = null;
  try {
    response = await callAPI(url, token, alwaysCreate, data);
  } catch (e) {
    console.error(`API call failed with status ${e.response.status}: ${e.response.statusText}`)
    console.error(e.response.data);
    return;
  }

  console.log("Complete. API returned");
  console.log();
  console.log(response);
  console.log();

  console.log("Done")
}

main(args['url'], args['token-file'], args['always-create'], args['data-file']);