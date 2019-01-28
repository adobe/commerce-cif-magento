/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const e = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const swagger = require('@adobe/commerce-cif-model/swagger');
const environment = require('./environment.json');
const argv = require('minimist')(process.argv);

// The package and namespace are coming from command-line arguments or read from the 'environment.json' file
let customerNamespace = argv['customer-namespace'] || environment.CUSTOMER_NAMESPACE;
let customerPackage = argv['customer-package'] || environment.CUSTOMER_PACKAGE;

// Changes the Swagger spec based on the parameters we just read
swagger.basePath = '/' + customerPackage;
swagger.info['x-ow-namespace'] = customerNamespace;
swagger.info['x-ow-package'] = customerPackage;

// Creates a temporary folder for the modified Swagger file
let tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'swagger-')) + '/swagger.json';
let api = fs.openSync(tmp, 'w');
fs.appendFileSync(api, JSON.stringify(swagger, null, 2));

// Deploys the REST API
console.log('Creating and deploying Swagger REST API file');
let cmd = `wsk api create --config-file ${tmp}`;
console.log(`> ${cmd}\n`);
e.execSync(cmd, {stdio: 'inherit'});