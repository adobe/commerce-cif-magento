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

const MagentoHealth = require('./MagentoHealth');
const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const ERROR_TYPE = require('./constants').ERROR_TYPE;



/**
 * This action returns the health status.
 *
 * @param   {string} args.MAGENTO_SCHEMA         Magento schema
 * @param   {string} args.MAGENTO_HOST           Magento host key
 * @param   {string} args.MAGENTO_API_VERSION    Magento api version
 * 
 * @param   {string} args.scope                  Optional parameter that specifies the scope(s) of the health check. A scope can be a service like Inventory, PIM or Order
 *                                               But now a fixed endpoint (modules) is used and scope is ignored
 *
 * @return  {Promise}
 */
function getHealth(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments();
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const health = new MagentoHealth(args, 'modules');

    return health.getHealth().catch(error => {
        return health.handleError(error);
    });

}

module.exports.main = getHealth;