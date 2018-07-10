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

/**
 * Returns an object used to configure an Openwhisk package in a serverless.yml file.
 * This is needed because it is not possible to define a variable key in the YML file.
 * Because of issues with the current working directory when reading and importing that file in serverless,
 * this code reads the currently deployed package name from the "ow-package" command line argument
 * passed to serverless.
 * 
 * @param {*} serverless The serverless config object passed by the serverless command-line program.
 */
module.exports = (serverless) => {
    let packageName = serverless.processedInput.options['ow-package'];
    
    let packageConfig = {};
    if (serverless.processedInput.options['shared']) {
        packageConfig.shared = true;
    }

    let config = {};
    config[packageName] = packageConfig;
    return config;
}