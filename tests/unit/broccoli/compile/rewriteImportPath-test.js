'use strict';

const path = require('path');
const expect = require('chai').expect;
const Compile = require('../../../../lib/broccoli/compile');
const _relative = Compile.relative;
const _rewriteImportPath = Compile._rewriteImportPath;

describe('Compile - rewriteImportPath', function() {
  let appAndAddons;
  let amdModules;
  let nodeModulesSrc;
  let projectRoot;

  let rewriteImportPath;

  beforeEach(function() {
    appAndAddons = path.resolve('/path/to/appAndAddons');
    amdModules = path.resolve('/path/to/amdModules');
    nodeModulesSrc = path.resolve('/path/to/nodeModulesSrc');
    projectRoot = path.resolve('/path/to/projectRoot');

    rewriteImportPath = _rewriteImportPath(
      appAndAddons,
      amdModules,
      nodeModulesSrc,
      projectRoot
    );
  });

  function relative(root, id) {
    return _relative(appAndAddons, path.join(root, id));
  }

  it('original addon lookup passes through', function() {
    let id = 'my-addon/addon';

    let result = rewriteImportPath(id);

    expect(result).to.equal('my-addon/addon');
  });

  it('removes .js', function() {
    let id = relative(appAndAddons, 'addon-tree-output/my-addon/addon.js');
    let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

    let result = rewriteImportPath(id, parent);

    expect(result).to.equal('my-addon/addon');
  });

  it('removes index.js', function() {
    let id = relative(appAndAddons, 'addon-tree-output/my-addon/index.js');
    let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

    let result = rewriteImportPath(id, parent);

    expect(result).to.equal('my-addon');
  });

  describe('absolute', function() {
    it('collides with project config/environment', function() {
      let id = path.join(projectRoot, 'config/environment.js');

      let result = rewriteImportPath(id);

      expect(result).to.equal('./config/environment');
    });

    it('config/environment', function() {
      let id = path.join(appAndAddons, 'app-tree-output/my-app/config/environment.js');
      let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('./config/environment');
    });

    it('node_modules', function() {
      let id = path.join(nodeModulesSrc, 'lodash/multiply.js');
      let parent = path.join(nodeModulesSrc, 'lodash/lodash.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('./multiply');
    });
  });

  describe('relative', function() {
    it('app to addon', function() {
      let id = relative(appAndAddons, 'addon-tree-output/my-addon/addon.js');
      let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('my-addon/addon');
    });

    it('app to node_modules', function() {
      let id = relative(nodeModulesSrc, 'lodash/multiply.js');
      let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('lodash/multiply');
    });

    it('app relative same dir', function() {
      let id = relative(appAndAddons, 'app-tree-output/my-app/resolver.js');
      let parent = relative(appAndAddons, 'app-tree-output/my-app/app.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('./resolver');
    });

    it('app relative different dir', function() {
      let id = relative(appAndAddons, 'app-tree-output/my-app/resolver.js');
      let parent = relative(appAndAddons, 'app-tree-output/my-app/routes/application.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('../resolver');
    });

    it('addon relative same dir', function() {
      let id = relative(appAndAddons, 'addon-tree-output/my-addon/addon.js');
      let parent = relative(appAndAddons, 'addon-tree-output/my-addon/index.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('./addon');
    });

    it('addon relative different dir', function() {
      let id = relative(appAndAddons, 'addon-tree-output/my-addon/addon.js');
      let parent = relative(appAndAddons, 'addon-tree-output/my-addon/lib/index.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('../addon');
    });

    it('node_modules relative same dir', function() {
      let id = relative(nodeModulesSrc, 'lodash/multiply.js');
      let parent = relative(nodeModulesSrc, 'lodash/lodash.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('./multiply');
    });

    it('node_modules relative different dir', function() {
      let id = relative(nodeModulesSrc, 'lodash/multiply.js');
      let parent = relative(nodeModulesSrc, 'lodash/lib/index.js');

      let result = rewriteImportPath(id, parent);

      expect(result).to.equal('../multiply');
    });
  });
});
