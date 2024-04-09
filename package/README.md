# npm-recursive-install
===

A small utility to recursively run `npm install` in any child directory that has a `package.json` file excluding sub directories of `node_modules`.

### Installation
---
`$ npm i npm-recursive-install --save-dev`


### Options
- `--production`:  Install dependencies with the `--production` option - skip dev dependencies.
- `--rootDir <directory>`:  Specify the root directory to start searching for `package.json` files.
- `--skipRoot`: Skip installation for the root `package.json`.
- `--skip <directories>`: Skip installation for specific directories.


Usage
---
`$ npm-recursive-install` - will install dependencies recursively except from node_modules directories.

`$ npm-recursive-install --skipRoot` - Will not install in `process.cwd()`.

`$ npm-recursive-install --rootDir=lib` - strat installing dependencies recuresively from the lib directory.

`$ npm-recursive-install --production` - Will not install dev dependencies

`$ npm-recursive-install --skip dist build` - Will skip installing dependencies from the dist and build folders

License
---
MIT
