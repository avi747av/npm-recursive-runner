# npm-recursive-runner

A powerful utility to recursively run npm commands in any child directory that has a `package.json` file. Formerly known as npm-recursive-install, this enhanced version allows you to run any command (not just `npm install`), with support for parallel execution.

## Features

- Run any npm command recursively across all package.json directories
- Skip node_modules and other specified directories
- Parallel execution with configurable concurrency
- Production mode support for install commands
- Customizable directory filtering

## Installation

```bash
npm install npm-recursive-runner --save-dev
```

## Options

- `--command <command>`: Specify the command to run in each directory (default: `npm install`)
- `--production`: When using install commands, add the `--production` flag to skip dev dependencies
- `--parallel`: Run commands in parallel for faster execution
- `--concurrency <number>`: Set the maximum number of concurrent processes (default: 4)
- `--rootDir <directory>`: Specify the root directory to start searching for package.json files
- `--skipRoot`: Skip execution for the root package.json
- `--skip <directories>`: Skip execution for specific directories
- `--includeDirectories <directories>`: Add specific directories for command execution

## Usage Examples

### Basic Usage

Run `npm install` in all package.json directories:

```bash
$ npm-recursive-runner
```

### Run Custom Commands

Run `npm ci` instead of npm install:

```bash
$ npm-recursive-runner --command="npm ci"
```

Run a build script in all packages:

```bash
$ npm-recursive-runner --command="npm run build"
```

Clean node_modules directories:

```bash
$ npm-recursive-runner --command="rm -rf node_modules"
```

### Parallel Execution

Run installations in parallel (4 concurrent processes by default):

```bash
$ npm-recursive-runner --parallel
```

Run with custom concurrency level:

```bash
$ npm-recursive-runner --parallel --concurrency=8
```

### Filtering Directories

Skip specific directories:

```bash
$ npm-recursive-runner --skip dist build
```

Start from a specific directory:

```bash
$ npm-recursive-runner --rootDir=packages
```

Skip root directory but process all others:

```bash
$ npm-recursive-runner --skipRoot
```

Include specific directories:

```bash
$ npm-recursive-runner --skip dist --includeDirectories dist/special-package
```

### Production Mode

Install dependencies without dev dependencies:

```bash
$ npm-recursive-runner --production
```

### Combining Options

Run a clean script in parallel across all packages except test packages:

```bash
$ npm-recursive-runner --command="npm run clean" --parallel --skip test-*
```

## Origin & Contributors

This package is an enhanced version of [npm-recursive-install](https://github.com/emgeee/recursive-install) originally created by [Matt Green](https://github.com/emgeee), extended with support for custom commands and parallel execution.

### Contributors
- [Avi Weiss] - Added custom command support and parallel execution
- [Matt Green](https://github.com/emgeee) - Creator of the original npm-recursive-install
## License

MIT