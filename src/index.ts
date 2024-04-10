#!/usr/bin/env node

import * as path from "path";
import { execSync } from "child_process";
import { argv, options } from "yargs";
import * as fg from "fast-glob";


options({
    "skip": {
        type: "array"
    }, 
    "includeDirectories" :{
        type: "array"
    }
})
interface YargsyargsArgav {
    production?: boolean,
    rootDir?: string,
    skipRoot?: boolean,
    skip?: string[],
    includeDirectories?: string[]
}

const yargsArgav = argv as YargsyargsArgav

const noop = (x: string) => x;

function getPackageJsonLocations(dirname: string) {
    const skipLocations = (yargsArgav.skip || []).map((dir) => `!**/${dir}`)
    const pattern = ["**/package.json", "!**/node_modules/**", "!**/.*", ...skipLocations];
    const results: string[] = fg.sync(pattern, { cwd: dirname, absolute: true });
    const includeDirectories = (yargsArgav.includeDirectories||[]).map(directory => path.join(process.cwd(), directory))
    results.push(...includeDirectories)
    return results.map((fileName) => fileName.replace(/\/package\.json$/, "")).sort();
}

function npmInstall(dir: string) {
    var exitCode = 0;
    try {
        if (yargsArgav.production) {
            console.log(
                "Installing " + dir + "/package.json with --production option"
            );
            const output = execSync("npm install --production", { cwd: dir });
            console.log(output?.toString() || "")
        } else {
            console.log("Installing " + dir + "/package.json");
            const output = execSync("npm install", { cwd: dir, stdio: "inherit" });
            console.log(output?.toString() || "")
        }
        console.log("");
    } catch (err: any) {
        exitCode = err.status;
        console.log(`An error occuerred - ${err.message}`)
    }

    return {
        dirname: dir,
        exitCode: exitCode,
    };
}

function filterRoot(dir: string) {
    if (path.normalize(dir) === path.normalize(process.cwd())) {
        console.log("Skipping root package.json");
        return false;
    } else {
        return true;
    }
}

if (require.main === module) {
    var exitCode = getPackageJsonLocations(
        yargsArgav.rootDir ? yargsArgav.rootDir : process.cwd()
    )
        .filter(yargsArgav.skipRoot ? filterRoot : noop)
        .map(npmInstall)
        .reduce(function (code, result) {
            return result.exitCode > code ? result.exitCode : code;
        }, 0);
    const end = Date.now();
    process.exit(exitCode);
}
