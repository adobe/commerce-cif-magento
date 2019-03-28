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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

class MagentoHealth extends MagentoClientBase {
    
    constructor(args, endpoint) {
        super(args, null, endpoint, ERROR_TYPE);
    }
    
    getHealth() {
        let start = process.hrtime();
        return this._execute('GET').then( () => {
            //const mapperArgs = [result];
            //const mappedResponse = this.mapper.apply(this, mapperArgs);
            let end = process.hrtime(start);
            let duration = Math.round(((end[0] * 1e9) + end[1]) / 1e6);
            let rslt = {
                "reports": [
                  {
                    "scope": this.baseEndpoint,
                    "healthy": true,
                    "message": "Response time: "+duration+"ms"
                  }
                ]
              };
              return this._handleSuccess(rslt);
              //return this._handleSuccess(result);
            }).catch(error => {
            return this.handleError(error);
        });
    }
}

module.exports = MagentoHealth;