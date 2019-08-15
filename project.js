const path = require('path');
const fs = require('fs');
const git = require('simple-git')();
const shell = require('shelljs');
const chalk = require('chalk');

// ENVIRONMENT should be configured in '.env' file.
require('dotenv').config();
const config = require(`./config.${process.env.ENVIRONMENT}.json`);

const args = process.argv.slice(2);

switch (args[0]) {
    case 'init':
        cloneAllRepositories();
        break;
    case 'update':
        updateAllRepositories();
        break;
    case 'mklinks':
        createModulesSymlinks();
        break;
    case 'restart-iis':
        recycleApplicationPool();
        break;
    case 'build-modules':
        buildAllModules();
        break;
    default:
        console.log('You should use args: init, pull, mklinks, restart-iis, build-modules commands');
}
return;

/**

* Build all .NET module projects on current branch.
 */
function buildAllModules() {
    config.repositories.forEach(repository => {
        if (repository.type === 'module') {
            buildModule(repository);
        }
    });
}

function buildModule(repository) {
    const repositoryPath = getRepositoryPath(repository);
            
    const restoreResult = shell.exec(`${config.build.nugetPath} restore ${repositoryPath}`, {silent:true}).code === 0 
        ? chalk.green('Ok') 
        : chalk.red('Fail');
    const buildResult = shell.exec(`"${config.build.msbuildPath}" ${repositoryPath}`, {silent:true}).code === 0 
        ? chalk.green('Ok') 
        : chalk.red('Fail');
    console.log(`'${repository.name}' - restore packages: ${restoreResult}, build: ${buildResult}`);
}

/**
 * Recycle iis application pool. Faster then `iis reset` command.
 */
function recycleApplicationPool() {
    shell.exec(`${config.iis.appcmdPath} recycle apppool /apppool.name:"${config.iis.apppool}"`);
}

/**
 * Clone repositories configured in 'repositories.json'.
 * If exists - skip.
 */
function cloneAllRepositories() {
    config.repositories.forEach(repository => {
        let destinationPath = getRepositoryPath(repository);
        if (fs.existsSync(destinationPath)) {
            console.log(`'${chalk.green(repository.name)}' already exists in '${destinationPath}'.`);
        } else {
            cloneRepository(repository, destinationPath); 
        }
    });
}

/**
 * Git pull default branches on all repositories.
 * If not exists - skip.
 */
function updateAllRepositories() {
    config.repositories.forEach(repository => {
        let destinationPath = getRepositoryPath(repository);
        if (fs.existsSync(destinationPath)) {
            pullRepository(destinationPath, config.branch.all);
        } else {
            console.log(`Repository '${repository.name}' not cloned.`);
        }
    });
}

/**
 * Create symlinks for all modules to 'directories.platformModulesRoot' directory.
 * Should be executed with admin permissions!
 */
function createModulesSymlinks() {
    config.repositories.forEach(repository => {
        if (repository.type === 'module') {
            createSymlink(repository);
        }
    });
}

function createSymlink(repository) {
    const repositoryPath = getRepositoryPath(repository);

    const webDirs = fs.readdirSync(repositoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('Web'))
        .map(dirent => dirent.name);

    const target = path.join(repositoryPath, webDirs[0]);
    console.log(target);
        
    fs.symlinkSync(target, getLinkPath(config.directories.platformModulesRoot, repository.name));
}

function getLinkPath(modulesRoot, moduleName) {
    return path.join(modulesRoot, moduleName);
}

function getRepositoryPath(repository) {
    return path.join(config.directories.repositoriesRoot, repository.name);
}

function getRepositoryUrl(repositoryUrl) {
    let url = new URL(repositoryUrl);
    url.username = process.env.USERNAME;
    url.password = process.env.PASSWORD;

    return url.href;
}

function cloneRepository(repository, destinationPath) {
    console.log(`Starting clone '${repository.name}' to '${destinationPath}'`);
    
    const repositoryUrl = getRepositoryUrl(repository.url);

    return git.clone(repositoryUrl, destinationPath, () => {
        console.log(`Finished clone '${repository.name}'`);
    });
}

function pullRepository(repositoryPath, branches) {
    git.cwd(repositoryPath);
    branches.forEach(branch => {
        console.log(`Starting pull '${branch}' in '${repositoryPath}'`);
        git.pull('origin', branch, () => {
            console.log(`Finished pull '${branch}' in '${repositoryPath}'`);
        }); 
    });
}