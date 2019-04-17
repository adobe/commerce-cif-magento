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

const CI = require('./ci.js');
const ci = new CI();

ci.context();

let pkg = ci.parsePackage("package.json");

ci.stage('PROVISION PROJECT');
ci.sh('npm install');

ci.stage('SECURITY AUDIT');
ci.sh('npm run audit');

if ("test" in pkg.scripts) {
    ci.stage('UNIT TESTS');
    ci.sh('mkdir -p test/results/unit');
    ci.sh('npm test');

    // Upload coverage to Codecov
    ci.sh('npm install codecov');
    ci.sh('$(npm bin)/codecov');
}

if ("test-it" in pkg.scripts && process.env.CORE_WSK_AUTH_STRING) {
    ci.stage('INTEGRATION TESTS');
    ci.sh('mkdir -p test/results/integration');

    let branch = process.env.CIRCLE_BRANCH.replace(/[\W_]+/g, "");
    let buildNum = process.env.CIRCLE_BUILD_NUM.replace(/[\W_]+/g, "");
    process.env.OW_PACKAGE_SUFFIX = `magento-${branch}-${buildNum}`;

    try {
        // Fix serverless permissions
        ci.sh('$(npm bin)/lerna run fix-serverless-permission');

        ci.withWskCredentials(process.env.WSK_API_HOST, process.env.CORE_WSK_NAMESPACE, process.env.CORE_WSK_AUTH_STRING, () => {
            ci.sh('$(npm bin)/lerna run deploy-suffix --concurrency 1');
        });

        if (fs.existsSync('customer-deployment') && process.env.CUSTOMER_WSK_AUTH_STRING) {
            ci.dir('customer-deployment', () => {
                ci.withWskCredentials(process.env.WSK_API_HOST, process.env.CUSTOMER_WSK_NAMESPACE, process.env.CUSTOMER_WSK_AUTH_STRING, () => {
                    ci.withCredentials(process.env.BACKEND_CREDENTIALS, () => {
                        ci.withEnvironment(process.env.BACKEND_ENVIRONMENT, () => {
                            ci.sh('npm install');

                            // Fix serverless permissions
                            ci.sh('npm run fix-serverless-permission');

                            let params = '--customer-package magento@' + process.env.OW_PACKAGE_SUFFIX + ' --customer-namespace ' + process.env.CUSTOMER_WSK_NAMESPACE + ' --bindings-namespace ' + process.env.CORE_WSK_NAMESPACE;
                            ci.sh('$(npm bin)/serverless deploy ' + params);

                            // Deploy the REST API
                            ci.sh('npm run deploy-rest-api -- ' + params);
                            ci.sh('sleep 15'); // sleep to let nginx pick up the new API config
                        });
                    });
                });
            });
        }

        let endpoint = `${process.env.OW_ENDPOINT}/magento@${process.env.OW_PACKAGE_SUFFIX}`;
        ci.sh(`OW_ENDPOINT='${endpoint}' npm run test-it`);

    } finally {
        if (fs.existsSync('customer-deployment') && process.env.CUSTOMER_WSK_AUTH_STRING) {
            ci.dir('customer-deployment', () => {
                ci.withWskCredentials(process.env.WSK_API_HOST, process.env.CUSTOMER_WSK_NAMESPACE, process.env.CUSTOMER_WSK_AUTH_STRING, () => {
                    let params = '--customer-package magento@' + process.env.OW_PACKAGE_SUFFIX + ' --customer-namespace ' + process.env.CUSTOMER_WSK_NAMESPACE + ' --bindings-namespace ' + process.env.CORE_WSK_NAMESPACE;
                    ci.sh('$(npm bin)/serverless remove ' + params);

                    // Remove the REST API
                    ci.sh('wsk api delete magento@' + process.env.OW_PACKAGE_SUFFIX);
                });
            });
        }

        ci.withWskCredentials(process.env.WSK_API_HOST, process.env.CORE_WSK_NAMESPACE, process.env.CORE_WSK_AUTH_STRING, () => {
            ci.sh('$(npm bin)/lerna run remove-suffix --concurrency 1');
        });
    }
}

ci.stage('BUILD DONE');