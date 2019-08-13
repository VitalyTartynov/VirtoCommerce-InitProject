# VirtoCommerce-InitProject
Simple tool for automate developing process. This tool automate clone, update and make symlinks for our virtocommerce modules/storefront/theme.

## Usage
1. Run `npm install`;
2. Update information in 'directories.json`, 'secrets.json', 'iis-settings.json' and 'repositories.json' if needed.
   
* `npm run init` for clone all repositories
* `npm run update` for update dev/qa branches 
* `npm run restart-iis` for restart iis (recycle application pool)
* `npm run mklinks` for create mklinks for modules in platform repository (last should be run with admin permissions);
