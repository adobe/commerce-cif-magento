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

module.exports = class CI {

    /**
     * Print build context to stdout.
     */
    context() {
        console.log("Node version: %s", process.version);
        this.sh('printf "NPM version: $(npm --version)"');
    };

    /**
     * Switch working directory for the scope of the given function.
     */
    dir(dir, func) {
        let currentDir = process.cwd();
        process.chdir(dir);
        console.log('// Changed directory to: ' + process.cwd());
        try {
            func();
        } finally {
            process.chdir(currentDir);
            console.log('// Changed directory back to: ' + currentDir);
        }
    };

    /**
     * Checkout git repository with the given branch into the given folder.
     */
    checkout(repo, branch = 'master', folder = '') {
        this.sh('git clone -b ' + branch + ' ' + repo + ' ' + folder);
    };

    /**
     * Run shell command and attach to process stdio.
     */
    sh(command) {
        console.log(command);
        return e.execSync(command, {stdio: 'inherit'});
    };

    /**
     * Parse and return the package.json in the current directory.
     */
    parsePackage(path = "package.json") {
        let f = fs.readFileSync(path);
        return JSON.parse(f);
    };

    /**
     * Set wsk credentials for the scope of the given function.
     */
    withWskCredentials(host, namespace, auth, func) {
        try {
            console.log(`wsk -i property set --auth XXX --apihost ${host} --namespace ${namespace}`);
            e.execSync(`wsk -i property set --auth ${auth} --apihost ${host} --namespace ${namespace}`, {stdio: 'inherit'});
            func();
        } finally {
            this.sh('rm -f ~/.wskprops');
        }
    };

    /**
     * Set CT credentials for the scope of the given function.
     */
    withCredentials(credentials, func) {
        try {
            fs.writeFileSync('credentials.json', credentials || "");
            console.log('// Created file credentials.json.');
            func();
        } finally {
            fs.unlinkSync('credentials.json');
            console.log('// Deleted file credentials.json.');
        }
    };

    /**
     * Print stage name.
     */
    stage(name) {
        console.log("\n------------------------------\n" +
            "--\n" +
            "-- %s\n" +
            "--\n" +
            "------------------------------\n", name);
    };

    /**
     * Configure a git impersonation for the scope of the given function.
     */
    gitImpersonate(user, mail, func) {
        try {
            this.sh('git config --local user.name ' + user + ' && git config --local user.email ' + mail)
            func()
        } finally {
            this.sh('git config --local --unset user.name && git config --local --unset user.email')
        }
    };

    /**
     * Configure git credentials for the scope of the given function.
     */
    gitCredentials(repo, func) {
        try {
            this.sh('git config credential.helper \'store --file .git-credentials\'');
            fs.writeFileSync('.git-credentials', repo);
            console.log('// Created file .git-credentials.');
            func()
        } finally {
            this.sh('git config --unset credential.helper');
            fs.unlinkSync('.git-credentials');
            console.log('// Deleted file .git-credentials.');
        }
    };

    /**
     * Parse the version bump from a release tag.
     */
    parseVersionBump(tag) {
        if (tag.endsWith('-patch')) {
            return 'patch';
        } else if (tag.endsWith('-minor')) {
            return 'minor';
        } else if (tag.endsWith('-major')) {
            return 'major';
        }
        return null;
    };

    /**
     * Determine the module to be released from a release tag and a given object
     * with module to path mappings.
     */
    parseReleaseModule(tag, mappings) {
        return Object.keys(mappings).find(key => tag.startsWith(`@${key}@`));
    };

};