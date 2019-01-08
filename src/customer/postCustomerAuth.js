/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
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

const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const ERROR_TYPE = require('./constants').ERROR_TYPE;
const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');

/**
 * This action performs a user login.
 *
 * @param   {string} args.MAGENTO_SCHEMA         Magento schema
 * @param   {string} args.MAGENTO_HOST           Magento host key
 * @param   {string} args.MAGENTO_API_VERSION    Magento api version
 * @param   {string} args.type                   the authentication type, either 'guest' or 'credentials'
 * @param   {string} args.email                  the email address of the customer
 * @param   {string} args.password               the password for the customer
 *
 * @return  {AuthenticationResponse}             an AuthenticationResponse object
 */
function login(args) {

    const validator = new InputValidator(args, ERROR_TYPE);

    validator.checkArguments()
             .mandatoryParameter('type')
             .matchRegexp('type', /^(guest|credentials)$/);
    
    if (args.type && args.type == 'credentials') {
        validator.mandatoryParameter('email')
                 .mandatoryParameter('password');
    }
 
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    // Guest authentification is not supported in Magento
    if (args.type == 'guest') {
        return new MagentoClientBase(args, null, '', ERROR_TYPE).handleError({statusCode: 501});
    }
}

module.exports.main = login;