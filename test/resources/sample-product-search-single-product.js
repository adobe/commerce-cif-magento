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

"use strict";

const simpleProductResponse = {
    body: {
        data: {
            products: {
                total_count: 1,
                page_info: {
                    page_size: 1,
                    current_page: 1
                },
                items: [
                    {
                        id: 1,
                        sku: "testSimpleProduct",
                        name: "Test Simple Product",
                        url_key: "test-simple-product",
                        description: null,
                        media_gallery_entries: [
                            {
                                id: 1,
                                "position": 1
                            },
                            {
                                id: 2,
                                "position": 2
                            }
                        ],
                        custom_string_attribute: "test",
                        created_at: "2018-06-12 11:15:02",
                        updated_at: "2018-06-12 11:15:02",
                        stock_status: "OUT_OF_STOCK",
                        categories: [
                            {
                                id: 3
                            }
                        ],
                        price: {
                            regularPrice: {
                                amount: {
                                    value: 22,
                                    currency: "USD"
                                }
                            }
                        },
                        image: null
                    }
                ]
            }
        }
    }
};

const productWithVariantsResponse = {
    body: {
        data: {
            products: {
                total_count: 1,
                page_info: {
                    page_size: 25,
                    current_page: 1
                },
                items: [{
                    id: 6,
                    sku: "testConfigProduct",
                    name: "Test Configurable Product",
                    url_key: "test-config-product",
                    description: null,
                    created_at: "2018-06-12 11:15:07",
                    updated_at: "2018-06-12 11:15:12",
                    categories: [
                        {
                            id: 3
                        }
                    ],
                    price: {
                        regularPrice: {
                            amount: {
                                value: 10,
                                currency: "USD"
                            }
                        }
                    },
                    image: "no_selection",
                    variants: [
                        {
                            product: {
                                id: 3,
                                sku: "testConfigProduct-red",
                                name: "Test Red Configurable Product",
                                url_key: "test-config-product",
                                description: null,
                                created_at: "2018-06-12 11:15:05",
                                updated_at: "2018-06-12 11:15:09",
                                stock_status: "IN_STOCK",
                                categories: [
                                    {
                                        id: 3
                                    }
                                ],
                                price: {
                                    regularPrice: {
                                        amount: {
                                            value: 10,
                                            currency: "USD"
                                        }
                                    }
                                },
                                image: "no_selection",
                                color: 4
                            }
                        }
                    ]
                }]
            }
        }
    }
};

module.exports = {
    simpleProductResponse,
    productWithVariantsResponse
};
