[![CircleCI](https://circleci.com/gh/adobe/commerce-cif-magento.svg?style=svg)](https://circleci.com/gh/adobe/commerce-cif-magento)
[![codecov](https://codecov.io/gh/adobe/commerce-cif-magento/branch/master/graph/badge.svg)](https://codecov.io/gh/adobe/commerce-cif-magento)

# Commerce Integration Framework (CIF) on Cloud for Magento

## Introduction

The CIF on Cloud services architecture is based on [Apache OpenWhisk](https://openwhisk.apache.org) & [Adobe I/O Runtime](https://www.adobe.io/apis/cloudplatform/runtime.html). The main building blocks of the new commerce services are serverless functions (OpenWhisk actions). These actions run on Adobe I/O Runtime inside an isolated container, stateless and serverless interacting with the commerce backend system or other endpoints via their APIs. 

This project contains the OpenWhisk actions implementation for [Magento](https://www.magento.com/).

## Getting Started

### Magento GraphQL and aggregated cart extension

The CIF Cloud Magento integration relies on the new [Magento graphQL implementation](https://github.com/magento/graphql-ce) for the products integration, and on a dedicated [Magento extension for the carts integration](https://github.com/adobe/commerce-cif-magento-extension).

### Project structure

This project is organized around commerce microservices. Each microservice domain lives in a separate folder and is developed and released independently. All code is organized in the `src` folder.

```
src
├── carts
├── categories
├── common
├── customers
├── orders
└── products
```

The `common` folder has a special role, it contains code which is re-used across multiple microservices.

The project also has dependencies/relationships to the following sub projects:

|  Project | Description |
| ------------- | ------------- |
| [commerce-cif-api](https://github.com/adobe/commerce-cif-api) | API definition of the CIF: Swagger File, Java API definition, Java Model, JavaScript Model  |
| [commerce-cif-common](https://github.com/adobe/commerce-cif-common) | Common code for CIF implementations: common actions, validators, exceptions. |

### Tools

To get started with CIF on Cloud, first make sure you have the following tools installed:
* Node 7.x or 8.x
* NPM 4.x or 5.x
* [OpenWhisk CLI](https://github.com/apache/incubator-openwhisk-cli/releases)

OpenWhisk CLI must be available in your systems PATH and set up correctly to either use a local OpenWhisk installation or an Adobe I/O account. Try `wsk --help` to make sure it is working.

### Build & Deployment

To install all the npm dependencies and bootstrap lerna, simply run:
```
$ npm install
```

## The "real-world deployment"

The real-world deployment scenario consists of a 2-namespaces (provider and consumer) scenario. 
(Note that switching between users/namespaces just means updating your `~/.wskprops` with the credentials of the expected user/namespace)

### Provider shared packages
The packages and actions developed in this repository are meant to be deployed as OpenWhisk `shared packages`: we call this part of the deployment the `provider` part. This deployment should be done by a user/namespace meant to provide shared packages to other consumer/customer users. With the provider `~/.wskprops` file set and in the top/root directory of this project, simply call

```
$ lerna run deploy-package
```

to create all the shared packages and deploy all the actions in the `provider` namespace. By default, the consumer/customer deployment part (see next section) expects that the provider namespace is called `cif-core`, but this is not mandatory.

Note that `lerna run deploy-package` will simply call `npm run deploy-package` in all the subfolders under `src`.

For each microservice domain like `products`, running the `deploy-package` script will create 2 shared packages in the provider namespace like for example:
* `/cif-core/commerce-cif-magento-product@0.0.1` (at the time of writing this doc)
* `/cif-core/commerce-cif-magento-product@latest`

The 1st package extracts the version number from the `package.json` file of the microservice, for example from [src/products/package.json](src/products/package.json) for the [products](src/products) microservice.

The 2nd package with the `latest` version is meant to always contain the latest version of the microservice. This is also used by the consumer/customer deployment. If everything worked well, calling `wsk -i package list` should show all the shared packages that have been deployed.

To remove all the provider packages call
```
$ lerna run remove-package
```
To deploy/remove/redeploy the actions of a microservice domain, see the corresponding README for each microservice.

### Consumer/customer deployment
The folder [customer-deployment](customer-deployment) contains a sample deployment project that demonstrates how a consumer/customer would use some shared packages deployed by a provider. See the README in this folder for instructions. Remember that you will have to switch to a consumer/customer `~/.wskprops` file when doing the consumer/customer deployment.

## Build & Deployment notes

### Lerna
The repository contains multiple node packages with local cross-dependencies. To automatically handle these dependencies and build all packages, we use the [lerna](https://github.com/lerna/lerna) tool.

Calling `lerna clean` removes the `node_modules` directories of all the node packages under `src/`. **Only** call `lerna bootstrap` to reinstall all the `node_modules` dependencies for all the packages (this is typically done once to initialize all the packages or to add new cross-local dependencies). It is usually better to always call `lerna clean` before calling `lerna bootstrap` as lerna seems to have some issues with circular dependencies.

If you change the code of an existing action, you don't have to use `lerna` for anything, just redeploy your action/function. If you add a new Node.js package with new actions under `src/`, just call `lerna clean; lerna bootstrap` from the root of the repository. If you add some (remote) Node.js dependencies to a package, just use `npm` to install the new dependencies for that package. If you add some local dependency from one package to another local package, call `lerna clean; lerna bootstrap` from the root of the repository.

### Serverless
The OpenWhisk actions can be deployed using [serverless](https://serverless.com/framework/docs/providers/openwhisk/) framework.
Actions and sequences are declared in the `serverless.yml` file of each business domain class located under `./src`. 

To deploy all actions in one of the `./src` folder, you can call `npm run deploy`, and to remove all actions just use `npm run remove`. 
For reference, during the deployment, actions are zipped and stored in the `.serverless` directory.

It is also possible to use `serverless` directly to deploy a single action. First navigate to the action folder (i.e `./src/carts`) and execute `$ serverless deploy function -f NAME` (with `NAME` referring to the name of a function declared in `serverless.yml`). 

The execution of `npm install` will automatically trigger a script, that downloads released module dependencies declared in the
`serverless.yml` file.

## Testing
For testing, each package is configured to perform a static code analysis using *[ESLint](http://eslint.org/)* as well as executing
*[Mocha](https://mochajs.org/)* unit tests. For unit tests, *[chai.js](http://chaijs.com/)* is used for assertions and
*[sinon.js](http://sinonjs.org/)* can be used for mocking. We use *[istanbul.js](https://github.com/istanbuljs/nyc)* to collect testing code coverage.

To run linting, tests and coverage analysis for all modules, run in the root package:
```
$ npm test

```
The same command is also available for each individual package. Running individual ITs is also possible:

```
$ NODE_TLS_REJECT_UNAUTHORIZED=0 OW_ENDPOINT='https://hostname/api/v1/web/cif-customer' npm run test-it
```
System environment variables, like OW_ENDPOINT can be adapted to use a custom OpenWhisk environment or namespace.

## Logging

OpenWhisk activation log provide logging information for your actions. Use:
```
$ wsk activation list
```
to get the last action actions and 
```
$ wsk activation get <id>
```
to get the log details for a particular activation.

If you run OpenWhisk locally it is possible to get detailed logs by using the `wskadmin` tool available directly on the openwhisk server.
To get some detailed logging info, just use `wskadmin syslog get -g activation-id` with the `activation-id` of the action you want to debug. Then identify the tag `tid_XXX` in the output, and use `wskadmin syslog get -t XXX` to get some detailed information about that so-called transaction.

### Contributing
 
 Contributions are welcomed! Read the [Contributing Guide](.github/CONTRIBUTING.md) for more information.
 
 ### Licensing
 
 This project is licensed under the Apache V2 License. See [LICENSE](.github/LICENSE) for more information.