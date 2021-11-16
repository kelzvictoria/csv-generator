# Overview

This app provides a Bulk Import CSV Generator for SIPML Outstanding Docs

This project uses NPM

## Requirements

- Node
- Npm
- Git

Node and git can be installed through [homebrew](https://brew.sh/) on MacOS. If you need to support more than one version of node at the same time, you can consider installing it though [nvm](https://github.com/nvm-sh/nvm) instead of homebrew.

## Getting Started

After installing Node and npm, you can follow the following steps.

```sh
git clone https://gitlab.pmglobaltechnology.com/pmglobal/sipml/bulk-import-tool.git
cd bulk-import-tool
npm install

```

The `npm install` will install all the dependencies.

### Set up the environment file

Create a file named .env in the root directory

Copy the content of variables.env into the newly created.env file

Fill in the missing values with the appropriate credentials. Ask your
team-lead for help in getting these values from the server.

It is important to obtain these values before running the app if not certain requests cannot be granted through the app.

## Environment Variables

- `STANBIC_IBTC_CLIENT_ID` - `6518649306807093-ndjx7rpk.api-clients.formelo.stanbicibtcpension.com`
- `APP_PORT` - This should be the port the App is running on. Defaults to `8080`
- `APP_SCHEME` - This should be the protocol the App is running on. Defaults to `http`
- `APP_PATH` - `/bulk-import-test`

## File and Directory Structure

/uploads is where all uploaded files are stored. It has the following subdirectories

- /files
- /generated-csv
- /uploaded-folder

Files are written directory into these subdirectories; the uploads folder should be a writable directory

### Launch the app

run `node app.js` from the root directory
