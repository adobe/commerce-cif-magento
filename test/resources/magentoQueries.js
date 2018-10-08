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

const magentoAllFieldsQuery = `
{
  searchProducts: products(filter: {sku: {eq: "meskwielt"}}) {
    total: total_count
    results: items {
      sku
      name
      id: sku
      createdAt: created_at
      lastModifiedAt: updated_at
      description
      categories {
        id
      }
      image
      color
      size
      features
      summary
      price {
        regularPrice {
          amount {
            currency
            amount: value
          }
        }
      }
      ... on ConfigurableProduct {
        variants {
          product {
            sku
            createdAt: created_at
            lastModifiedAt: updated_at
            id: sku
            name
            description
            categories {
              id
            }
            image
            color
            size
            features
            summary
            price {
              regularPrice {
                amount {
                  currency
                  amount: value
                }
              }
            }
          }
        }
        configurable_options {
          attribute_code
          values {
            value_index
            label
          }
          label
        }
      }
    }
    page_info {
      page_size
      current_page
    }
  }
}`;

const magentoCategoriesQuery = `
{
  searchProducts: products(search: "meskwielt") {
    results: items {
      categories {
        id
      }
    }
  }
}`;

const magentoPricesQuery = `
{
  searchProducts: products(search: "meskwielt") {
    results: items {
      price {
        regularPrice {
          amount {
            currency
            amount: value
          }
        }
      }
    }
  }
}`;

const magentoAttributesQuery = `
{
  searchProducts: products(search: "meskwielt") {
    results: items {
      color
      size
      features
      summary
      ... on ConfigurableProduct {
        variants {
          product {
            color
            size
            features
            summary
          }
        }
        configurable_options {
          attribute_code
          values {
            value_index
            label
          }
          label
        }
      }
    }
  }
}`;

const magentoAssetsQuery = `
{
  searchProducts: products(search: "meskwielt") {
    results: items {
      image
    }
  }
}`;

const magentoVariantsQuery = `
{
  searchProducts: products(search: "meskwielt") {
    results: items {
      ... on ConfigurableProduct {
        variants {
          product {
            sku
            createdAt: created_at
            lastModifiedAt: updated_at
            id: sku
            name
            description
            categories {
              id
            }
            image
            color
            size
            features
            summary
            price {
              regularPrice {
                amount {
                  currency
                  amount: value
                }
              }
            }
          }
        }
        configurable_options {
          attribute_code
          values {
            value_index
            label
          }
          label
        }
      }
    }
  }
}`;

module.exports = { magentoAllFieldsQuery, magentoPricesQuery, magentoAttributesQuery, magentoAssetsQuery, magentoCategoriesQuery, magentoVariantsQuery };