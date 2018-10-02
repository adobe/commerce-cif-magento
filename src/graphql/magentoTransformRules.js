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

const Price = {
    removers: ["country"],
    adders: [{
        when: "country",
        add: "currency"
    }],
    amount: {
        alias: "value"
    }
};

const Category = {
    ignore: ["children", "parents", "mainParentId"],
    adders: [{
        when: ["children", "parents", "mainParentId"],
        add: "id"
    }],
    createdAt: {
        alias: "created_at"
    },
    lastModifiedAt: {
        alias: "updated_at"
    },
}

const _commonProduct = {
    removers: ["assets", "attributes"],
    adders: [
        {
            when: "assets",
            add: "image"
        },
        {
            when: "attributes",
            add: ["color", "size", "features", "summary"]
        }
    ],
    movers: [
        {
            from: "prices",
            to: "price.regularPrice.amount"
        }
    ],
    createdAt: {
        alias: "created_at"
    },
    lastModifiedAt: {
        alias: "updated_at"
    },
    id: {
        alias: "sku"
    },
    prices: Price,
    categories: Category
};

const ProductVariant = Object.assign({}, _commonProduct,
    {
        movers: _commonProduct.movers.concat([{
            to: "product"
        }]),
        removers: _commonProduct.removers.concat(["available"]),
        adders: _commonProduct.adders.concat([
            {
                when: "available",
                add: "sku"
            }
        ])
    });

const Product = Object.assign({}, _commonProduct,
    {
        removers: _commonProduct.removers.concat(["masterVariantId"]),
        adders: _commonProduct.adders.concat([
            {
                when: "masterVariantId",
                add: ["sku", "variants.sku"]
            },
            {
                when: "variants.attributes",
                add: "configurable_options"
            }
        ]),
        inlineFragments: [
            {
                typeName: "ConfigurableProduct",
                fields: ['variants', 'configurable_options']
            }
        ],
        configurable_options: {
            adders: [
                {
                    add: ['attribute_code', 'values', 'label']
                }
            ],
            values: {
                adders: [
                    {
                        add: ['value_index', 'label']
                    }
                ]
            }
        },
        categories: Category,
        variants: ProductVariant
    });

const PagedResponse = {
    removers: ["count", "offset", "facets"],
    adders: [
        {
            when: ["count", "facets"],
            add: ["total"]
        },
        {
            when: ["count", "offset"],
            add: ["page_info.page_size", "page_info.current_page"]
        }
    ],
    total: {
        alias: "total_count"
    },
    results: Object.assign({}, Product, { alias: "items" })
};

const transformRules = {
    searchProducts: Object.assign(
        {},
        PagedResponse,
        { alias: "products" }
    )
};

module.exports = transformRules;