npm-recursive-install
===

A small utility to recursively run `npm install` in any child directory that has a `package.json` file excluding sub directories of `node_modules`.

Install
---
`$ npm i recursive-install --save-dev`

Usage
---
`$ npm-recursive-install` - will install dependencies recursively except from node_modules

`$ npm-recursive-install --skip-root` - Will not install in `process.cwd()`

`$ npm-recursive-install --rootDir=lib` - Will only install from lib directory

`$ npm-recursive-install --production` - Will not install dev dependencies

`$ npm-recursive-install --skip dist build` - Will skip installing dependencies from the dist and build folders

License
---
MIT
