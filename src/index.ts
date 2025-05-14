#!/usr/bin/env node
import * as path from "path";
import { execSync } from "child_process";
import { argv, options } from "yargs";
import * as fg from "fast-glob";
import pLimit from "p-limit"; // You'll need to install this package

options({
    "skip": {
        type: "array"
    }, 
    "includeDirectories": {
        type: "array"
    },
    "parallel": {
        type: "boolean",
        default: false,
        description: "Run installations in parallel"
    },
    "concurrency": {
        type: "number",
        default: 4,
        description: "Maximum number of concurrent installations when parallel is enabled"
    }
})

interface YargsyargsArgav {
    production?: boolean,
    rootDir?: string,
    skipRoot?: boolean,
    skip?: string[],
    includeDirectories?: string[],
    parallel?: boolean,
    concurrency?: number
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
        console.log(`An error occurred - ${err.message}`)
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
    const start = Date.now();
    const directories = getPackageJsonLocations(
        yargsArgav.rootDir ? yargsArgav.rootDir : process.cwd()
    ).filter(yargsArgav.skipRoot ? filterRoot : noop);
    
    let results: { dirname: string, exitCode: number }[] = [];
    
    if (yargsArgav.parallel) {
        // Parallel execution
        const limit = pLimit(yargsArgav.concurrency || 4);
        
        const tasks = directories.map(dir => {
            return limit(() => {
                console.log(`Starting installation for ${dir}`);
                return npmInstall(dir);
            });
        });
        
        Promise.all(tasks)
            .then(installResults => {
                const exitCode = installResults.reduce((code, result) => {
                    return result.exitCode > code ? result.exitCode : code;
                }, 0);
                
                const end = Date.now();
                console.log(`All installations completed in ${(end - start)/1000} seconds`);
                process.exit(exitCode);
            })
            .catch(err => {
                console.error("Error running parallel installations:", err);
                process.exit(1);
            });
    } else {
        // Sequential execution (original behavior)
        const exitCode = directories
            .map(npmInstall)
            .reduce((code, result) => {
                return result.exitCode > code ? result.exitCode : code;
            }, 0);
        
        const end = Date.now();
        console.log(`All installations completed in ${(end - start)/1000} seconds`);
        process.exit(exitCode);
    }
}