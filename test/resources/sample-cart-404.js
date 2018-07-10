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
    "statusCode": 404,
    "message": "404 - {\"message\":\"No such entity with %fieldName = %fieldValue\",\"parameters\":{\"fieldName\":\"cartId\",\"fieldValue\":null}}",
    "error": {
        "message": "No such entity with %fieldName = %fieldValue",
        "parameters": {
            "fieldName": "cartId",
            "fieldValue": null
        }
    },
    "options": {
        "uri": "http://magento-graph-ql.test/rest/V1/guest-carts/0e198f355b5dec9d916bfce9184df201-",
        "method": "GET",
        "headers": {
            "accept": "application/json",
            "content-type": "application/json; charset=utf-8",
            "pragma": "no-cache",
            "cache-control": "no-cache"
        },
        "json": true,
        "simple": true,
        "resolveWithFullResponse": false,
        "transform2xxOnly": false
    },
    "response": {
        "statusCode": 404,
        "body": {
            "message": "No such entity with %fieldName = %fieldValue",
            "parameters": {
                "fieldName": "cartId",
                "fieldValue": null
            }
        },
        "headers": {
            "server": "nginx/1.12.0",
            "date": "Wed, 06 Jun 2018 15:24:19 GMT",
            "content-type": "application/json; charset=utf-8",
            "transfer-encoding": "chunked",
            "connection": "close",
            "vary": "Accept-Encoding",
            "x-powered-by": "PHP/7.1.18",
            "set-cookie": [
                "PHPSESSID=3j5b658gb8qq2d6du5gntblcc6; expires=Wed, 06-Jun-2018 16:24:19 GMT; Max-Age=3600; path=/; domain=magento-graph-ql.test; HttpOnly"
            ],
            "expires": "Thu, 19 Nov 1981 08:52:00 GMT",
            "cache-control": "no-store, no-cache, must-revalidate",
            "pragma": "no-cache"
        },
        "request": {
            "uri": {
                "protocol": "http:",
                "slashes": true,
                "auth": null,
                "host": "magento-graph-ql.test",
                "port": 80,
                "hostname": "magento-graph-ql.test",
                "hash": null,
                "search": null,
                "query": null,
                "pathname": "/rest/V1/guest-carts/0e198f355b5dec9d916bfce9184df201-",
                "path": "/rest/V1/guest-carts/0e198f355b5dec9d916bfce9184df201-",
                "href": "http://magento-graph-ql.test/rest/V1/guest-carts/0e198f355b5dec9d916bfce9184df201-"
            },
            "method": "GET",
            "headers": {
                "accept": "application/json",
                "content-type": "application/json; charset=utf-8",
                "pragma": "no-cache",
                "cache-control": "no-cache"
            }
        }
    }
};