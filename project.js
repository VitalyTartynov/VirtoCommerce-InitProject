const path = require('path');
const fs = require('fs');
const git = require('simple-git')();
var cmd = require('node-cmd');

const secrets = require('./secrets.json');
const repositories = require('./repositories.json');
const directories = require('./directories.json');
const iisSettings = require('./iis-settings.json');

const branches = ['dev', 'qa'];

var args = process.argv.slice(2);

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
    default:
        console.log('You should use args: init, pull, mklinks, restart-iis commands');
    }
return;

/**
 * Recycle iis application pool. Faster then `iis reset` command.
 */
function recycleApplicationPool() {
    cmd.run(`${iisSettings.appcmdPath} recycle apppool /apppool.name:"${iisSettings.apppool}"`);
}

/**
 * Clone repositories configured in 'repositories.json'.
 * If exists - skip.
 */
function cloneAllRepositories() {
    repositories.forEach(repository => {
        let destinationPath = getRepositoryPath(repository);
        if (fs.existsSync(destinationPath)) {
            console.log(`Repository '${repository.name}' exists in '${destinationPath}'.`);            
        } else {
            cloneRepository(repository, secrets, destinationPath); 
        }
    });
}

/**
 * Git pull default branches on all repositories.
 * If not exists - skip.
 */
function updateAllRepositories() {
    repositories.forEach(repository => {
        let destinationPath = getRepositoryPath(repository);
        if (fs.existsSync(destinationPath)) {
            pullRepository(destinationPath, branches);
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
    repositories.forEach(repository => {
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
        
    fs.symlinkSync(target, getLinkPath(directories.platformModulesRoot, repository.name));
}

function getLinkPath(modulesRoot, moduleName) {
    return path.join(modulesRoot, moduleName);
}

function getRepositoryPath(repository) {
    return path.join(directories.repositoriesRoot, repository.name);
}

function getRepositoryUrl(repositoryUrl, secrets) {
    let url = new URL(repositoryUrl);
    url.username = secrets.username;
    url.password = secrets.password;

    return url.href;
}

function cloneRepository(repository, secrets, destinationPath) {
    console.log(`Starting clone '${repository.name}' to '${destinationPath}'`);
    
    const repositoryUrl = getRepositoryUrl(repository.url, secrets);

    return git.clone(repositoryUrl, destinationPath, () => {
        console.log(`Finished clone '${repository.name}'`);
    });
}

function pullRepository(repositoryPath, branches) {
    git.cwd(repositoryPath);
    branches.forEach(branch => {
        console.log(`Starting pull '${branch}' in '${repositoryPath}'`)
        git.pull('origin', branch, () => {
            console.log(`Finished pull '${branch}' in '${repositoryPath}'`);
        }); 
    });
}