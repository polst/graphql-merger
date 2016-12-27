'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphqlMerger = undefined;

var _templateObject = _taggedTemplateLiteral(['dir'], ['dir']);

exports.default = graphqlModulesMerger;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//https://github.com/MarkTiedemann/throw-if-missing
var x = function x(p) {
  throw new Error('Missing parameter: ' + p);
};

//https://gist.github.com/nishant8BITS/f4ce80ce3e976f7532b3
var getGlobbedFiles = function getGlobbedFiles(globPatterns, removeRoot) {
  // For context switching
  var _this = this;
  // URL paths regex
  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
  // The output array
  var output = [];

  // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
  if (Array.isArray(globPatterns)) {
    globPatterns.forEach(function (globPattern) {
      var subset = _this.getGlobbedFiles(globPattern, removeRoot);
      output = [].concat(_toConsumableArray(output), _toConsumableArray(subset));
    });
  } else if (typeof globPatterns === 'string' || globPatterns instanceof String) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      var files = _glob2.default.sync(globPatterns);
      if (removeRoot) {
        files = files.map(function (file) {
          return file.replace(removeRoot, '');
        });
      }
      output = [].concat(_toConsumableArray(output), _toConsumableArray(files));
    }
  }
  return output;
};

// --- MERGE RESOLVERS
var mergeModuleResolvers = function mergeModuleResolvers(moduleResolvers, baseResolvers) {
  moduleResolvers.forEach(function (module) {
    baseResolvers = (0, _lodash2.default)(baseResolvers, module);
  });
  return baseResolvers;
};

// --- MERGE MODULES
var mergeData = function mergeData(dest, src) {
  if (src) {
    if (Array.isArray(src)) {
      dest.concat(src);
    } else {
      dest.push(src);
    }
  }
};

// Deliver finel version of the schema
var graphqlMerger = exports.graphqlMerger = function graphqlMerger() {
  var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : x(_templateObject);

  var _graphqlModulesMerger = graphqlModulesMerger(dir),
      Schema = _graphqlModulesMerger.Schema,
      SetupFunctions = _graphqlModulesMerger.SetupFunctions;

  var FinalSchema = {
    typeDefs: ['\n      type Query {\n        # Extended by typeDefs\n         bogusBulderTricksTheQueryCompiler: Int\n      }\n      type Mutation {\n        # Extended by typeDefs\n        bogusBulderTricksTheMutationCompiler: Int\n      }\n      type Subscription {\n        # Extended by typeDefs\n        bogusBulderTricksTheSubscriptionCompiler: Int\n      }\n      ' + Schema.typeDefs + '\n      schema {\n        query: Query\n        mutation: Mutation\n        subscription: Subscription\n      }\n    '],
    resolvers: Schema.resolvers
  };

  return { Schema: FinalSchema, SetupFunctions: SetupFunctions };
};

//https://gist.github.com/icebob/553c1f9f1a9478d828bcb7a08d06790a
//Deliver partial version of schema
function graphqlModulesMerger() {
  var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : x(_templateObject);


  var moduleTypeDefinitions = [];
  var moduleResolvers = [];
  var moduleSetupFunctions = [];

  var files = getGlobbedFiles(_path2.default.join(dir, "**", "*.graphql.js"));

  // Load schema files
  files.forEach(function (file) {
    var moduleSchema = require(_path2.default.resolve(file));
    mergeData(moduleTypeDefinitions, moduleSchema.typeDefs);
    mergeData(moduleResolvers, moduleSchema.resolvers);
    moduleSetupFunctions = mergeModuleResolvers(moduleSetupFunctions, moduleSchema.setupFunctions);
  });

  // --- MERGE TYPE DEFINITONS
  var schema = moduleTypeDefinitions.join("\n");

  return { Schema: {
      typeDefs: schema,
      resolvers: mergeModuleResolvers(moduleResolvers, {})
    }, SetupFunctions: moduleSetupFunctions };
};

