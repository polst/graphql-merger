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

var _getGlobbedFiles = require('./lib/getGlobbedFiles');

var _getGlobbedFiles2 = _interopRequireDefault(_getGlobbedFiles);

var _mandatory = require('./lib/mandatory');

var _mandatory2 = _interopRequireDefault(_mandatory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); } //https://gist.github.com/icebob/553c1f9f1a9478d828bcb7a08d06790a


// --- MERGE RESOLVERS
var mergeModuleResolvers = function mergeModuleResolvers(moduleResolvers, baseResolvers) {
  moduleResolvers.forEach(function (module) {
    baseResolvers = (0, _lodash2.default)(baseResolvers, module);
  });
  return baseResolvers;
};

var mergeData = function mergeData(dest, src) {
  if (src) {
    if (Array.isArray(src)) {
      dest.concat(src);
    } else {
      dest.push(src);
    }
  }
};

var graphqlMerger = function graphqlMerger() {
  var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _mandatory2.default)(_templateObject);

  var _graphqlModulesMerger = graphqlModulesMerger(dir),
      Schema = _graphqlModulesMerger.Schema,
      Subscriptions = _graphqlModulesMerger.Subscriptions;

  var FinalSchema = {
    typeDefs: ['\n    ' + Schema.typeDefs + '\n    \n    schema {\n      query: Query\n      mutation: Mutation\n    }\n  '],
    resolvers: Schema.resolvers
  };

  return { Schema: FinalSchema, Subscriptions: Subscriptions };
};

exports.graphqlMerger = graphqlMerger;
function graphqlModulesMerger() {
  var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _mandatory2.default)(_templateObject);


  var moduleTypeDefinitions = [];
  var moduleResolvers = [];
  var moduleSubscriptions = [];

  var files = (0, _getGlobbedFiles2.default)(_path2.default.join(dir, "**", "*.graphql.js"));

  // Load schema files
  files.forEach(function (file) {
    var moduleSchema = require(_path2.default.resolve(file));
    mergeData(moduleTypeDefinitions, moduleSchema.typeDefs);
    mergeData(moduleResolvers, moduleSchema.resolvers);
    mergeData(moduleSubscriptions, moduleSchema.subscriptions);
  });

  // --- MERGE TYPE DEFINITONS
  var schema = '\n    type Query {\n      # Extended by typeDefs\n       bogusBulderTricksTheQueryCompiler: Int\n    }\n    type Mutation {\n      # Extended by typeDefs\n      bogusBulderTricksTheMutationCompiler: Int\n    }\n    ' + moduleTypeDefinitions.join("\n") + '\n  ';

  var Schema = {
    typeDefs: schema,
    resolvers: mergeModuleResolvers(moduleResolvers, {})
  };

  return { Schema: Schema, Subscriptions: moduleSubscriptions };
};

