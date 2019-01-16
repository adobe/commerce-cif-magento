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

const customerMapper = require('./CustomerMapper');
const MagentoCustomer = require('./MagentoCustomer');

/**
 * This action returns the customer data based on the authentication token.
 *
 * @param   {string} args.MAGENTO_SCHEMA         Magento schema
 * @param   {string} args.MAGENTO_HOST           Magento host key
 * @param   {string} args.MAGENTO_API_VERSION    Magento api version
 *
 * @return  {Customer}                           A Customer object
 */
function getCustomer(args) {
    const magentoCustomer = new MagentoCustomer(args, customerMapper.mapCustomer);
    return magentoCustomer.getCustomer();
}

module.exports.main = getCustomer;