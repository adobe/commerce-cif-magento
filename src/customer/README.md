# Authentication

This package implements the [CIF REST authentication flow](https://github.com/adobe/commerce-cif-api/tree/master/documentation#authentication).

However, and because Magento does not support guest/anonymous tokens, sending a `guest` POST authentication request to `/customers/auth` will return an HTTP 501 "Not implemented" response.

In this case, a CIF REST client should simply record that guest authentication is not supported, and SHOULD NOT send any `Authorization` header while performing other guest/anonymous CIF REST operations like getting product data or creating a new anonymous cart. CIF REST operations that do not require any customer token, but still require a Magento integration token (e.g. accessing products and categories data), will automatically fallback to using the `MAGENTO_INTEGRATION_TOKEN` configured in the [customer deployment project](../../customer-deployment).

As soon as a customer login is performed via `/customers/auth`, a CIF REST client MUST send the newly obtained customer token in the `Authorization: Bearer` token of all subsequent CIF REST operations. All CIF REST operations will then be performed with the customer token which basically "carries" the identity of the customer. For example, sending an HTTP POST to `/carts` will create a new cart for the customer identified by the bearer token.

Upon logout, a CIF REST client MUST simply stop sending the bearer token in subsequent CIF REST operations. In this case, it is up to the CIF REST client (browser, mobile phone application) to simply delete and stop sending the customer token.