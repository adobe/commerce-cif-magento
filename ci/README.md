# CIF REST Continuous Integration Setup

## 1. Automation with CircleCI

The CircleCi configuration can be found in the [.circleci](.circleci) folder. The actual CI logic is implemented using JavaScript and available in the [ci](ci) folder.

### 1.1 Build
During the `Build` job, we provision the project and run unit and integration tests. For integration testing, we deploy the actions on Adobe I/O Runtime and configure them to run against a Magento instance. The `Build` job is executed on every push.

### 1.2 Release
To release a package, the `Release` job is used. It can be triggered by adding a Git tag to the latest commit on master. The tag has to consist of both the name of the package and the version bump (`@PACKAGE-NAME@release-(patch|minor|major)`). You can find all possible release-able package names in the [modules.json](modules.json) file. The possible release bumps are `patch`, `minor` and `major`.

During the release, the version in the `package.json` file is increased and the change is committed. Therefore, the release script checks out the latest commit of the `master` branch. Releases on branches are not possible. 

After a successful release, the manually added git tag is removed from the origin and replaced by a git tag that includes the released version. However, it is important that you remove the manually added release tag from your local repository. Otherwise you might accidentally push it again and trigger another release.

**Example**:
To release a minor version update of the carts package, add the following tag to the latest commit:
```bash
# Create tag locally
git tag -a @commerce-cif-magento-cart@release-minor -m "@commerce-cif-magento-cart@release-minor"

# Push tag to origin
git push origin @commerce-cif-magento-cart@release-minor

# After the release
git tag -d @commerce-cif-magento-cart@release-minor
```

## 2. Local Execution

### 2.1. Requirements
Please have [Docker](https://docs.docker.com/install/) (17.09+) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

On Mac, you can use [Docker for Mac](https://docs.docker.com/docker-for-mac/) that installs the Docker CLI and Docker Compose natively and targets a hidden Linux VM.

*Attention:* Please be aware that because of issues ([Serverless#4660](https://github.com/serverless/serverless/issues/4660), [Docker for Mac#2296](https://github.com/docker/for-mac/issues/2296) and [Docker for Mac#76](https://github.com/docker/for-mac/issues/76)) with Docker for Mac and Serverless, running `npm install` inside a volume that is mapped to your Mac might fail. Please use the container either without the volume (e.g. `docker cp`) or run it on Linux.

### 2.2. Build Container
The `adobe/commerce-cif-ci-env` image is available via [Docker Hub](https://hub.docker.com/r/adobe/commerce-cif-ci-env).

### 2.3. Run Builds and Releases
The containers can be configured via environment variables. Please make sure, all required values are provided by either setting them in the `docker-compose.yml` file or via your terminal.

To run the containers, run the following commands in the `/ci` folder.

* Get latest image from Docker Hub: `docker-compose pull`
* Build project `docker-compose run build`
* Release project `docker-compose run release`

### 2.4. Debug Inside Containers
If something goes wrong inside the container, you can execute the following command to open a terminal session inside the container:

`docker-compose run build bash`

You can then either run `npm` commands directly or debug the build (`ci/build.js`) and release (`ci/release.js`) scripts.