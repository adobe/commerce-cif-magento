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

let allFieldsQuery = `{
    searchProducts(filter: "sku:meskwielt") {
      offset
      count
      total
      results {
        sku
        name
        id
        createdAt
        lastModifiedAt
        description
        masterVariantId
        prices {
          currency
          country
          amount
        }
        categories {
          id
        }
        assets {
          url
        }
        attributes {
          id
          name
          value
          isVariantAxis
        }
        variants {
          sku
          createdAt
          lastModifiedAt
          id
          name
          description
          prices {
            currency
            country
            amount
          }
          categories {
            id
          }
          assets {
            url
          }
          attributes {
            id
            name
            value
            isVariantAxis
          }
          available
        }
      }
    }
}`;

let pricesQuery = `{
    searchProducts(text: "meskwielt") {
        results {
          prices {
            country
            currency
            amount
          }
        }
    }
}`;

let attributesQuery = `{
    searchProducts(text: "meskwielt") {
        results {
          attributes {
            id
            name
            value
            isVariantAxis
          }
          variants {
            attributes {
              id
              name
              value
              isVariantAxis
            }
          }
        }
      }
}`;

let assetsQuery = `{
    searchProducts(text: "meskwielt"){
        results {
            assets {
                id
                url
            }
        }
    }
}`;

let categoriesQuery = `{
    searchProducts(text: "meskwielt"){
        results {
            categories {
                id
            }
        }
    }
}`;

let variantsQuery = `{
    searchProducts(text: "meskwielt"){
        results {
            variants {
                sku
                createdAt
                lastModifiedAt
                id
                name
                description
                available
                prices {
                    currency
                    country
                    amount
                }
                categories {
                    id
                }
                assets {
                    url
                }
                attributes {
                    id
                    name
                    value
                    isVariantAxis
                }
            }
        }
    }
}`;

let pageInfoQuery = `{
    searchProducts(text: "meskwielt"){
        total
        count
        offset
    }
}`;

let syntaxError = `{
    searchProducts(text: "meskwielt"){
        total
}`;

let invalidField = `{
    searchProducts(text: "meskwielt"){
        results {
            unicorn
        }
    }
}`;

let filterAndTextMissing = `{
    searchProducts(limit: 10){
        results {
            sku
            lastModifiedAt
        }
    }
}`;

const introspectionQuery = `query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }`;

module.exports = { filterAndTextMissing, invalidField, syntaxError, allFieldsQuery, introspectionQuery, pricesQuery, attributesQuery, assetsQuery, categoriesQuery, variantsQuery, pageInfoQuery };
