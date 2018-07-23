# CIF Cloud example customer deployment

This folder contains an example customer deployment project. It shows how a customer can create package bindings and packages with web actions/sequences that use the shared action packages available in the [src](../src) folder.

## Quick start

Copy the file `credentials-example.json` and name it `credentials.json`, add your Magento credentials in that file, make sure that you currently have a `~/.wskprops` file with the credentials of a user/namespace meant to deploy customer actions (= different than the namespace of the shared action packages), and simply run

`npm install; npm run deploy`

This will create one package for each micro-service (`carts`, `categories`, `customers`, `orders`, and `products`) and will also deploy all the web actions/sequences for each micro-service in a common `magento` package.

For example, for `products` it will:
* create the package `/cif-customer/commerce-cif-magento-product@latest` (in the default `cif-customer` customer namespace). This is a package binding to the shared package implementing the `products` Magento actions. Note that this binding will be configured with the Magento credentials defined in `credentials.json`.
* deploy the `products` actions in the `/cif-customer/magento` package.

We use the `latest` version for the package bindings so that this example customer deployment project always uses the latest available versions of the shared actions. In a real project, a customer should rather point to a particular version to make sure that future changes do not break their deployment. The versions of the package bindings are defined in the `serverless.yml` deployment file. 

To remove all the customer packages and actions, just run `npm run clean`.

## The serverless.yml file

The `serverless.yml` file contains a list of all the package `bindings` and actions that will be deployed. The names of all the packages and actions are defined with variables so that the same serverless deployment file can be reused for CI/CD automation.

When running the deployment, it is possible to override the following parameters:
* the customer namespace with the parameter `--customer-namespace`
* the customer package used to deploy the final web actions with the parameter `--customer-package`
* the namespace that contains the shared/provider packages with the parameter `--bindings-namespace`

These parameters can be passed to the deployment file via npm, like for example `npm run deploy -- --customer-namespace mynamespace`.

## The credentials.json file

This file contains the Magento credentials of the customer's project. Simply copy the file `credentials-example.json` and name it `credentials.json`, and add your Magento credentials to the file. The field `MAGENTO_AUTH_TOKEN` should contain a Magento token (integration or user token) that has the permissions to access the Magento catalog, cart, and order endpoints.
 
## Deployment

The `package.json` file contains a number of scripts that can be used to deploy all package bindings and actions. First install all dependencies with

`npm install`

and then install all bindings and actions with

`npm run deploy`

To remove all bindings and actions, simply use

`npm run clean`
