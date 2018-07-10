# Continuous Integration with Containers

## 1. Requirements
Please have [Docker](https://docs.docker.com/install/) (17.09+) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

On Mac, you can use [Docker for Mac](https://docs.docker.com/docker-for-mac/) that installs the Docker CLI and Docker Compose natively and targets a hidden Linux VM.

*Attention:* Please be aware that because of issues ([Serverless#4660](https://github.com/serverless/serverless/issues/4660), [Docker for Mac#2296](https://github.com/docker/for-mac/issues/2296) and [Docker for Mac#76](https://github.com/docker/for-mac/issues/76)) with Docker for Mac and Serverless, running `npm install` inside a volume that is mapped to your Mac might fail. Please use the container either without the volume (e.g. `docker cp`) or run it on Linux.

## 2. Build Container
The `adobe/commerce-cif-ci-env` image is available via [Docker Hub](https://hub.docker.com/r/adobe/commerce-cif-ci-env).

## 3. Run Builds and Releases
The containers for building and releasing can be configured via environment variables. Please make sure, all required values are provided by either setting them in the `docker-compose.yml` file or via your terminal.

To run the containers, run the following commands in the `/ci` folder.

* Get latest image from Docker Hub: `docker-compose pull`
* Build project `docker-compose run build`
* Release project `docker-compose run release`

## 4. Debug Inside Containers
If something goes wrong inside the container, you can execute the following command to open a terminal session inside the container:

`docker-compose run build bash`

You can then either run `npm` commands directly or debug the build (`ci/build.js`) and release (`ci/release.js`) scripts.