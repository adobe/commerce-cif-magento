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

const fs = require('fs');
const path = require('path');

module.exports = {
    getPathForAction: function (testDirName, action) {
        return testDirName.replace(path.sep + 'test' + path.sep, path.sep + 'src' + path.sep).concat(path.sep).concat(action);
    },

    parseJsonFile: function(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'))
    },

    clone: function(object) {
        return JSON.parse(JSON.stringify(object));
    }
};