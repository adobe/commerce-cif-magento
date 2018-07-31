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

const CI = require('./ci.js');
const ci = new CI();

ci.context();

// Modules in this repository
const modules = JSON.parse(fs.readFileSync('ci/modules.json'));

// Check for tag
let gitTag = process.env.CIRCLE_TAG;
if (!gitTag) {
    return;
}

// Find module of that release
let moduleToRelease = ci.parseModuleFromVersionTag(gitTag, modules);
if (!moduleToRelease) {
    throw new Error('Invalid version tag.');
}

ci.stage('DEPLOYMENT PROVISION');

// Check out released version
ci.sh(`git checkout '${gitTag}' `);

// Provision
ci.sh('npm install');

ci.stage(`PERFORM DEPLOYMENT OF ${moduleToRelease}`);

ci.dir(modules[moduleToRelease], () => {
    ci.withWskCredentials(process.env.WSK_API_HOST, process.env.PROD_WSK_NAMESPACE, process.env.PROD_WSK_AUTH_STRING, () => {
        ci.sh('npm run deploy-package');
    });
});

ci.stage('DEPLOYMENT DONE');