#!/usr/bin/env node
import * as path from "path";
import { exec } from "child_process";
import { argv, options } from "yargs";
import * as fg from "fast-glob";
import { promisify } from "util";

// Create promisified version of exec
const execPromise = promisify(exec);

options({
  skip: {
    type: "array",
  },
  includeDirectories: {
    type: "array",
  },
  parallel: {
    type: "boolean",
    default: false,
    description: "Run installations in parallel",
  },
  concurrency: {
    type: "number",
    default: 4,
    description:
      "Maximum number of concurrent installations when parallel is enabled",
  },
});

interface YargsyargsArgav {
  production?: boolean;
  rootDir?: string;
  skipRoot?: boolean;
  skip?: string[];
  includeDirectories?: string[];
  parallel?: boolean;
  concurrency?: number;
}

const yargsArgav = argv as YargsyargsArgav;

console.log({ yargsArgav });
const noop = (x: string) => x;

function getPackageJsonLocations(dirname: string) {
  const skipLocations = (yargsArgav.skip || []).map((dir) => `!**/${dir}`);
  const pattern = [
    "**/package.json",
    "!**/node_modules/**",
    "!**/.*",
    ...skipLocations,
  ];
  const results: string[] = fg.sync(pattern, { cwd: dirname, absolute: true });
  const includeDirectories = (yargsArgav.includeDirectories || []).map(
    (directory) => path.join(process.cwd(), directory)
  );
  results.push(...includeDirectories);
  return results
    .map((fileName) => fileName.replace(/\/package\.json$/, ""))
    .sort();
}

function filterRoot(dir: string) {
  if (path.normalize(dir) === path.normalize(process.cwd())) {
    console.log("Skipping root package.json");
    return false;
  } else {
    return true;
  }
}

// Helper function to chunk array into smaller arrays of specified size
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// function npmInstallAsync(
//   dir: string
// ): Promise<{ dirname: string; exitCode: number }> {
//   return new Promise((resolve) => {
//     try {
//       if (yargsArgav.production) {
//         console.log(
//           "Installing " + dir + "/package.json with --production option"
//         );
//         const command = "npm install --production";
//
//         const output = execSync(command, { cwd: dir });
//         console.log(output?.toString() || "");
//       } else {
//         console.log("Installing " + dir + "/package.json");
//         const command = "npm install";
//
//         const output = execSync(command, { cwd: dir, stdio: "inherit" });
//         console.log(output?.toString() || "");
//       }
//       console.log("");
//       resolve({ dirname: dir, exitCode: 0 });
//     } catch (err: any) {
//       const exitCode = err.status;
//       console.log(`An error occurred - ${err.message}`);
//       resolve({ dirname: dir, exitCode: exitCode });
//     }
//   });
// }

async function npmInstallAsync(
  dir: string
): Promise<{ dirname: string; exitCode: number }> {
  const command = yargsArgav.production
    ? "npm install --production"
    : "npm install";
  console.log(
    `Installing ${dir}/package.json${
      yargsArgav.production ? " with --production option" : ""
    }`
  );

  try {
    // execPromise returns { stdout, stderr }
    const { stdout, stderr } = await execPromise(command, { cwd: dir });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log("");

    return { dirname: dir, exitCode: 0 };
  } catch (error: any) {
    // Error already contains stdout and stderr
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);

    console.log(`An error occurred in ${dir} - ${error.message}`);
    return {
      dirname: dir,
      exitCode: error.code ? Number(error.code) : 1,
    };
  }
}
// Helper function to run installations sequentially
async function runInstallationsSequentially(directories: string[]) {
  const results: { dirname: string; exitCode: number }[] = [];

  for (const dir of directories) {
    const result = await npmInstallAsync(dir);
    results.push(result);
  }

  return results;
}

// Helper function to run installation in parallel with concurrency control
async function runInstallationsInParallel(
  directories: string[],
  concurrency: number
) {
  const allResults: { dirname: string; exitCode: number }[] = [];
  const chunks = chunkArray(directories, concurrency);

  for (const chunk of chunks) {
    console.log(`Starting batch of ${chunk.length} installations...`);
    // Run current batch in parallel
    const batchResults = await Promise.all(
      chunk.map((dir) => npmInstallAsync(dir))
    );
    allResults.push(...batchResults);
  }

  return allResults;
}

if (require.main === module) {
  const start = Date.now();
  const directories = getPackageJsonLocations(
    yargsArgav.rootDir ? yargsArgav.rootDir : process.cwd()
  ).filter(yargsArgav.skipRoot ? filterRoot : noop);

  // Use async IIFE to allow for await
  (async () => {
    try {
      let results;

      if (yargsArgav.parallel) {
        // Parallel execution
        const concurrency = yargsArgav.concurrency || 4;
        results = await runInstallationsInParallel(directories, concurrency);
      } else {
        // Sequential execution
        results = await runInstallationsSequentially(directories);
      }

      const exitCode = results.reduce((code, result) => {
        return result.exitCode > code ? result.exitCode : code;
      }, 0);

      const end = Date.now();
      console.log(
        `All installations completed in ${(end - start) / 1000} seconds`
      );
      process.exit(exitCode);
    } catch (err) {
      console.error("Error running installations:", err);
      process.exit(1);
    }
  })();
}