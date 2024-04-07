#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
// import {execSync} from "child_process";
const yargs_1 = require("yargs");
const fg = __importStar(require("fast-glob"));
(0, yargs_1.options)({
    "skip": {
        type: "array"
    }
});
const yargsArgav = yargs_1.argv;
const noop = (x) => x;
function getPackageJsonLocations(dirname) {
    console.log({ skip: yargsArgav.skip });
    const skipLocations = (yargsArgav.skip || []).map((dir) => `!**/${dir}`);
    console.log({ skipLocations });
    const pattern = ["**/package.json", "!**/node_modules/**", "!**/.*", ...skipLocations];
    const results = fg.sync(pattern, { cwd: dirname, absolute: true });
    return results.map((fileName) => path.join(dirname, fileName.replace(/\/package\.json$/, ""))).sort();
}
function npmInstall(dir) {
    var exitCode = 0;
    console.log({ dir });
    try {
        if (yargsArgav.production) {
            console.log("Installing " + dir + "/package.json with --production option");
            console.log(`should exec npm i on ${dir}`);
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
    const start = Date.now();
    var exitCode = getPackageJsonLocations(yargsArgav.rootDir ? yargsArgav.rootDir : process.cwd())
        .filter(yargsArgav.skipRoot ? filterRoot : noop)
        .map(npmInstall)
        .reduce(function (code, result) {
        return result.exitCode > code ? result.exitCode : code;
    }, 0);
    const end = Date.now();
    console.log("time: ", end - start);
    process.exit(exitCode);
}
