# CIF Cloud example customer deployment

This folder contains an example customer deployment project. It shows how a customer can create package bindings and packages with web actions/sequences that use the shared action packages available in the [src](../src) folder.

## Quick start

Copy the file `credentials-example.json` and name it `credentials.json`, add your Magento credentials in that file, make sure that you currently have a `~/.wskprops` file with the credentials of a user/namespace meant to deploy customer actions (= different than the namespace of the shared action packages), and simply run

`npm install; npm run deploy`

This will create one package for each micro-service (`carts`, `categories`, `customers`, `orders`, and `products`) and will also deploy all the web actions/sequences for each micro-service in a common `magento` package.

For example, for `products` it will:
* create the package `/cif-customer/commerce-cif-magento-product@latest` (in the default `cif-customer` customer namespace). This is a package binding to the shared package implementing the `products` Magento actions. Note that this binding will be configured with the Magento credentials defined in `credentials.json`.
* deploy the `products` actions in the `/cif-customer/magento` package.

To remove all the customer packages and actions, just run `npm run clean`.

## Package Versioning

For each microservice domain like products, Adobe prodvides two shared packages in the catalog namespace like for example:

```
/cif-core/commerce-cif-magento-product@1.0.0 (updated after each release deployment)
/cif-core/commerce-cif-magento-product@latest
```
Also see main [readme](../readme.md) for details.

We use the `latest` version for the package bindings so that this example customer deployment project always uses the latest available versions of the shared actions. The versions of the package bindings are defined in the `serverless.yml` deployment file, replace all `@latest` versions with the right version for each package to use a dedicated version.

_Recommendation_: for a real project, a customer should rather point to a particular version to make sure that future changes do not break their deployment. 

## The serverless.yml file

The `serverless.yml` file contains a list of all the package `bindings` and actions that will be deployed. The names of all the packages and actions are defined with variables so that the same serverless deployment file can be reused for CI/CD automation.

When running the deployment, it is possible to override the following parameters:
* the customer namespace with the parameter `--customer-namespace`
* the customer package used to deploy the final web actions with the parameter `--customer-package`
* the namespace that contains the shared/provider packages with the parameter `--bindings-namespace`

These parameters can be passed to the deployment file via npm, like for example `npm run deploy -- --customer-namespace mynamespace`.

## The credentials.json file

This file contains the Magento credentials of the customer's project. Simply copy the file `credentials-example.json` and name it `credentials.json`, and add your Magento credentials to the file.

The field `MAGENTO_INTEGRATION_TOKEN` should contain a Magento token (integration or user token) that has the permissions to access the Magento catalog (that is, products and categories) endpoints. Because not all endpoints require the integration token, this file is kept separate from the server configuration so that the credentials will not be bound by default.

The field `MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME` may contain the lifetime (in seconds) of a Magento customer token. This is **not** the lifetime of the integration token. This parameter will be used upon customer login, to set the `expires_in` field of the authentication response.

```javascript
{
    "MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME": "3600",         // (optional)  the lifetime (in seconds) of a Magento customer token 
    "MAGENTO_INTEGRATION_TOKEN": "INTEGRATION_ACCESS_TOKEN"   // (mandatory) an integration with catalog permissions
}
```
*(this commented JSON file cannot be used for the real deploment - the JSON format indeed does not allow comments)*

## The environment.json file

This file contains the Magento server configuration of the customer's project. Simply copy the file `environment-example.json` and name it `environment.json`, and add your Magento server configuration to the file. 

```javascript
{
    "MAGENTO_SCHEMA": "https",                                // (mandatory) always use "https" except for development or testing purposes
    "MAGENTO_HOST": "your-magento-server-without-slash",      // (mandatory) the fully qualified domain name of the Magento server
    "MAGENTO_API_VERSION": "V1",                              // (optional)  the version of the Magento REST API, "V1" by default
    "MAGENTO_MEDIA_PATH": "media/catalog/product",            // (mandatory) the path used to access images on the Magento instance
    "PRODUCT_VARIANT_ATTRIBUTES": ["color", "size"],          // (optional)  the list of VARIANT attributes axis
    "GRAPHQL_PRODUCT_ATTRIBUTES": ["color", "size"],          // (optional)  the list of ALL custom product attributes that should be fetched by graphQL
    "MAGENTO_IGNORE_CATEGORIES_WITH_LEVEL_LOWER_THAN": 2,     // (mandatory) the minimum depth of product categories in the Magento backend (0 being the root)

    "CUSTOMER_NAMESPACE": "your-customer-namespace",          // (mandatory) the namespace where this example deployment should be done
    "CUSTOMER_PACKAGE": "your-package-name",                  // (mandatory) the package where this example deployment should be done
    "BINDINGS_NAMESPACE": "ccif-core-library"                 // (mandatory) the namespace where the shared Magento packages are deployed
}
```
*(this commented JSON file cannot be used for the real deploment - the JSON format indeed does not allow comments)*

## Deployment

The `package.json` file contains a number of scripts that can be used to deploy all package bindings and actions. First install all dependencies with

`npm install`

and then install all bindings and actions with

`npm run deploy`

To remove all bindings and actions, simply use

`npm run clean`
