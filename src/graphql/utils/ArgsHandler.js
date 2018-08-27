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
 * Used for translating arguments of one GraphQL schema into another.
 * 
 * The ArgsHandler class handles arguments of an object ('_args' is arguments property by default)
 * as defined in the argsFunctions object.
 * It ignores all not arguments which have not been included in the argsFunctions.
 */
class ArgsHandler {

    /**
     * @param {Object}    argsFunctions           (argument name, handler function) object {String: Function}
     * @param {Object}    obligatoryArgsOnFields  (field name, enforced arguments to handle) object {String, String[]}
     * @param {String}    argsProperty            name of the arguments property ('_args' by default)
     * 
     */
    constructor(argsFunctions, obligatoryArgsOnFields = {}, argsProperty = '_args') {
        this.arguments = argsFunctions;
        this.fields = obligatoryArgsOnFields;
        this.args = argsProperty;
    }

    /**
     * Handles all declared arguments in the arguments property of an object
     * regarding their defined function.
     * 
     * @param {Object} obj          object to handle arguments of
     * @param {String} objName      name of the object (root), in case of obligatoryArgsOnFields
     */
    handle(obj, objName = '') {
        let args = obj[this.args] || {};                //check if the object has an arguments property
        let force = objName && this.fields[objName];  //check if the object might have enforced arguments
        if (args || force) {
            //execute arguments in object's arguments property                 
            Object.keys(args).forEach(a => {
                let f = this.arguments[a];              //handle argument if declared
                if (f) {
                    f(args);
                }
            });
            if (force) {                                //optionally handle absent enforced arguments
                this.fields[objName].forEach(a => {
                    // only execute if not already treated
                    if (!args[a]) {
                        this.arguments[a](args);
                    }
                });
            }
        }
    }

    /**
     * Handles not only the passed object but also it's properties
     * 
     * @param {Object} obj      object to deep handle arguments of
     * @param {String} objName  name of the object (root), in case of obligatoryArgsOnFields 
     */
    handleWholeObject(obj, objName = '') {
        Object.keys(obj).forEach(prop => {
            if (typeof obj[prop] === 'object') {
                this.handleWholeObject(obj[prop], prop);  //deep handle property if it's an object
            }
        });
        this.handle(obj, objName);
    }
}

module.exports = ArgsHandler;