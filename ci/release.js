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

const cp = require('child_process');
const CI = require('./ci.js');
const ci = new CI();

// Modules in this repository
const releaseableModules = {
    'commerce-cif-magento-cart': 'src/carts',
    'commerce-cif-magento-category': 'src/categories',
    'commerce-cif-magento-common': 'src/common',
    'commerce-cif-magento-customer': 'src/customer',
    'commerce-cif-magento-order': 'src/orders',
    'commerce-cif-magento-product': 'src/products'
}

ci.context();

// Check for tag
let gitTag = process.env.CIRCLE_TAG;
if (!gitTag) {
    return;
}

// Find module that should be release
let moduleToRelease = ci.parseModuleFromReleaseTag(gitTag, releaseableModules);
if (!moduleToRelease) {
    throw new Error('Invalid release tag.');
}

// Parse version bump term
let bump = ci.parseVersionBump(gitTag);
if (!bump) {
    throw new Error('Invalid release bump term.');
}

ci.stage('RELEASE PROVISION');

// We cannot find out what git branch has the tag, so we assume/enforce that releases are done on master
console.log('Checking out the master branch so we can commit and push');
ci.sh('git checkout master');

ci.sh('npm install');

ci.stage('PERFORM RELEASE ' + moduleToRelease + ':' + bump);
try {
    ci.gitImpersonate('CircleCi', 'noreply@circleci.com', () => {
        ci.dir(releaseableModules[moduleToRelease], () => {
            // Log in to npm
            ci.sh('echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc');

            // Increase version, remove the v prefix
            let newVersion = cp.execSync(`npm --no-git-tag-version version ${bump}`).toString().trim().substr(1);

            // Stage package.json
            ci.sh('git add -A package.json');
            ci.sh('git status');

            // Commit changes
            ci.sh(`git commit -m "@releng Release: @adobe/${moduleToRelease}-${newVersion}"`);

            // Add tag
            let versionTag = `@adobe/${moduleToRelease}-${newVersion}`;
            ci.sh(`git tag -a ${versionTag} -m "${versionTag}"`);

            // Publish to npm
            ci.sh('npm publish --access public');

            // Push changes to git
            ci.sh('git push');
            ci.sh(`git push origin @adobe/${moduleToRelease}-${newVersion}`);
        });
    });
} finally {
    // Log out from npm
    ci.sh('rm -f ~/.npmrc');

    // Remove release tag
    ci.sh(`git push --delete origin ${gitTag}`);
}

ci.stage('RELEASE DONE');