#!/usr/bin/env node
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
// import {execSync} from "child_process";
var yargs_1 = require("yargs");
var fg = require("fast-glob");
(0, yargs_1.options)({
    "skip": {
        type: "array"
    }
});
var yargsArgav = yargs_1.argv;
var noop = function (x) { return x; };
function getPackageJsonLocations(dirname) {
    console.log({ skip: yargsArgav.skip });
    var skipLocations = (yargsArgav.skip || []).map(function (dir) { return "!**/".concat(dir); });
    console.log({ skipLocations: skipLocations });
    var pattern = __spreadArray(["**/package.json", "!**/node_modules/**", "!**/.*"], skipLocations, true);
    var results = fg.sync(pattern, { cwd: dirname, absolute: true });
    return results.map(function (fileName) { return path.join(dirname, fileName.replace(/\/package\.json$/, "")); }).sort();
}
function npmInstall(dir) {
    var exitCode = 0;
    console.log({ dir: dir });
    try {
        if (yargsArgav.production) {
            console.log("Installing " + dir + "/package.json with --production option");
            console.log("should exec npm i on ".concat(dir));
            // execSync("npm install --production", { cwd: dir });
        }
        else {
            console.log("Installing " + dir + "/package.json");
            // execSync("npm install", { cwd: dir });
        }
        console.log("");
    }
    catch (err) {
        exitCode = err.status;
    }
    return {
        dirname: dir,
        exitCode: exitCode,
    };
}
function filterRoot(dir) {
    if (path.normalize(dir) === path.normalize(process.cwd())) {
        console.log("Skipping root package.json");
        return false;
    }
    else {
        return true;
    }
}
if (require.main === module) {
    var start = Date.now();
    var exitCode = getPackageJsonLocations(yargsArgav.rootDir ? yargsArgav.rootDir : process.cwd())
        .filter(yargsArgav.skipRoot ? filterRoot : noop)
        .map(npmInstall)
        .reduce(function (code, result) {
        return result.exitCode > code ? result.exitCode : code;
    }, 0);
    var end = Date.now();
    console.log("time: ", end - start);
    process.exit(exitCode);
}
