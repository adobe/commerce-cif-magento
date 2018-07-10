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
    "body": {
        "data": {
            "products": {
                "total_count": 3,
                "page_info": {
                    "page_size": 25,
                    "current_page": 1
                },
                "items": [
                    {
                        "id": 1,
                        "sku": "testSimpleProduct",
                        "name": "Test Simple Product",
                        "description": null,
                        "created_at": "2018-06-12 11:15:02",
                        "updated_at": "2018-06-12 11:15:02",
                        "categories": [
                            {
                                "id": 3
                            }
                        ],
                        "price": {
                            "regularPrice": {
                                "amount": {
                                    "value": 22,
                                    "currency": "USD"
                                }
                            }
                        },
                        "image": null
                    },
                    {
                        "id": 6,
                        "sku": "testConfigProduct",
                        "name": "Test Configurable Product",
                        "description": null,
                        "created_at": "2018-06-12 11:15:07",
                        "updated_at": "2018-06-12 11:15:12",
                        "categories": [
                            {
                                "id": 3
                            }
                        ],
                        "price": {
                            "regularPrice": {
                                "amount": {
                                    "value": 10,
                                    "currency": "USD"
                                }
                            }
                        },
                        "image": "no_selection",
                        "configurable_options": [
                            {
                                "attribute_code": "color",
                                "label": "Color",
                                "values": [
                                    {
                                        "value_index": 6,
                                        "label": "green"
                                    },
                                    {
                                        "value_index": 5,
                                        "label": "blue"
                                    },
                                    {
                                        "value_index": 4,
                                        "label": "red"
                                    }
                                ]
                            }
                        ],
                        "variants": [
                            {
                                "product": {
                                    "id": 3,
                                    "sku": "testConfigProduct-red",
                                    "name": "Test Red Configurable Product",
                                    "description": null,
                                    "created_at": "2018-06-12 11:15:05",
                                    "updated_at": "2018-06-12 11:15:09",
                                    "categories": [
                                        {
                                            "id": 3
                                        }
                                    ],
                                    "price": {
                                        "regularPrice": {
                                            "amount": {
                                                "value": 10,
                                                "currency": "USD"
                                            }
                                        }
                                    },
                                    "image": "no_selection",
                                    "color": 4
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }
};
