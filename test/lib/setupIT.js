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

const expect = require('chai').expect;

module.exports.setup = function () {

    let env = {};
    env.slow = 10000;
    env.timeout = 30000;

    // Get OpenWhisk endpoint from environment variable
    env.openwhiskEndpoint = process.env.OW_ENDPOINT;

    // Abort if no OpenWhisk endpoint was set
    expect(env.openwhiskEndpoint).to.have.string('http');

    // Sets the name of the package where all web actions are deployed
    // To make it very flexible, we crate one entry per microservice but still
    // only use one single package for all actions
    let mainPackage = `/magento/`;
    if (process.env.OW_PACKAGE_SUFFIX) {
        mainPackage = `/magento@${process.env.OW_PACKAGE_SUFFIX}/`
    }
    env.cartsPackage = mainPackage;
    env.categoriesPackage = mainPackage;
    env.customersPackage = mainPackage;
    env.productsPackage = mainPackage;
    env.ordersPackage = mainPackage;
    
    return env;

};
