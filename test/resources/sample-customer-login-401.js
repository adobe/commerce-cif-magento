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

module.exports = {
    "name": "StatusCodeError",
    "statusCode": 401,
    "message": "401 - {\"message\":\"The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.\"}",
    "error": {
      "message": "The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.",
      "trace": "removed"
    },
    "options": {
      "uri": "http://magento2.vagrant78/rest/V1/integration/customer/token",
      "method": "POST",
      "body": {
        "username": "whovever@adobe.com",
        "password": "wrong-password"
      },
      "headers": {
        "accept": "application/json",
        "content-type": "application/json; charset=utf-8",
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "authorization": "Bearer undefined"
      },
      "json": true,
      "simple": true,
      "resolveWithFullResponse": false,
      "transform2xxOnly": false
    },
    "response": {
      "statusCode": 401,
      "body": {
        "message": "The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.",
        "trace": "removed"
      },
      "headers": {
        "date": "Mon, 25 Jun 2018 11:35:26 GMT",
        "server": "Apache/2.4.7 (Ubuntu)",
        "x-powered-by": "PHP/7.1.17-1+ubuntu14.04.1+deb.sury.org+1",
        "set-cookie": [
          "PHPSESSID=lgamtngj7hbpfldqstvc0o7nso; expires=Mon, 25-Jun-2018 12:35:26 GMT; Max-Age=3600; path=/; domain=magento2.vagrant78; HttpOnly"
        ],
        "expires": "Thu, 19 Nov 1981 08:52:00 GMT",
        "cache-control": "no-store, no-cache, must-revalidate",
        "pragma": "no-cache",
        "content-length": "2559",
        "connection": "close",
        "content-type": "application/json; charset=utf-8"
      },
      "request": {
        "uri": {
          "protocol": "http:",
          "slashes": true,
          "auth": null,
          "host": "magento2.vagrant78",
          "port": 80,
          "hostname": "magento2.vagrant78",
          "hash": null,
          "search": null,
          "query": null,
          "pathname": "/rest/V1/integration/customer/token",
          "path": "/rest/V1/integration/customer/token",
          "href": "http://magento2.vagrant78/rest/V1/integration/customer/token"
        },
        "method": "POST",
        "headers": {
          "accept": "application/json",
          "content-type": "application/json; charset=utf-8",
          "pragma": "no-cache",
          "cache-control": "no-cache",
          "authorization": "Bearer undefined",
          "content-length": 54
        }
      }
    }
  }