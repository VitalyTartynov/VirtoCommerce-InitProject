# VirtoCommerce-InitProject
Simple tool for automate developing process. This tool automate clone, update and make symlinks for our virtocommerce modules/storefront/theme.

## Usage
1. Run `npm install`;
2. Update information in 'directories.json`, 'secrets.json', 'iis-settings.json', 'build-settings.json' and 'repositories.json' if needed.
   
* `npm run init` for clone all repositories
* `npm run update` for update dev/qa branches 
* `npm run restart-iis` for restart iis/recycle application pool (admin permissions needed)
* `npm run mklinks` for create mklinks for modules in platform repository (admin permissions needed)
* `npm run build-modules` for restore nuget packages and build modules