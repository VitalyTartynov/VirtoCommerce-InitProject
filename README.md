# VirtoCommerce-InitProject
Simple tool for automate VirtoCommerce platform developing process. This tool automate clone, update, build and make symlinks for our virtocommerce modules/storefront/theme.

## Usage
1. Run `npm install`;
2. Configure environment, github user in `.env` file (environment will be used for load config).
3. Create copy `config.json` with name like `config.environment_variable.json` and configure it.
   
* `npm run init` for clone all repositories
* `npm run update` for update dev/qa branches 
* `npm run restart-iis` for restart iis/recycle application pool (admin permissions needed)
* `npm run mklinks` for create mklinks for modules in platform repository (admin permissions needed)
* `npm run build-modules` for restore nuget packages and build modules
