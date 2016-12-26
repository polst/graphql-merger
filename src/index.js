import path from 'path';
import merge from 'lodash.merge';
import glob from 'glob';

//https://github.com/MarkTiedemann/throw-if-missing
const x = p => { throw new Error(`Missing parameter: ${p}`) };

//https://gist.github.com/nishant8BITS/f4ce80ce3e976f7532b3
const getGlobbedFiles = function getGlobbedFiles(globPatterns, removeRoot) {
  // For context switching
  let _this = this;
  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
  // The output array
  let output = [];

  // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
  if (Array.isArray(globPatterns)) {
    globPatterns.forEach(function(globPattern) {
      let subset = _this.getGlobbedFiles(globPattern, removeRoot);
      output = [...output, ...subset];
    });
  } else if ( (typeof globPatterns === 'string' || globPatterns instanceof String) ) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      let files = glob.sync(globPatterns);
      if (removeRoot) {
        files = files.map(function(file) {
          return file.replace(removeRoot, '');
        });
      }
      output = [...output, ...files];
    }
  }
  return output;
};

// --- MERGE RESOLVERS
const mergeModuleResolvers = function mergeModuleResolvers(moduleResolvers, baseResolvers) {
  moduleResolvers.forEach((module) => {
    baseResolvers = merge(baseResolvers, module);
  });
  return baseResolvers;
};

// --- MERGE MODULES
const mergeData = function mergeData(dest, src) {
  if (src) {
    if (Array.isArray(src)) {
      dest.concat(src);
    }
    else {
      dest.push(src);
    }
  }
};

// Deliver finel version of the schema
export const graphqlMerger = function graphqlMerger(dir = x`dir`) {
  let {Schema, Subscriptions} = graphqlModulesMerger(dir);

  const FinalSchema = {
    typeDefs: [`
      type Query {
        # Extended by typeDefs
         bogusBulderTricksTheQueryCompiler: Int
      }
      type Mutation {
        # Extended by typeDefs
        bogusBulderTricksTheMutationCompiler: Int
      }
      ${Schema.typeDefs}
      schema {
        query: Query
        mutation: Mutation
      }
    `],
    resolvers: Schema.resolvers
  };

  return {Schema: FinalSchema, Subscriptions};
};

//https://gist.github.com/icebob/553c1f9f1a9478d828bcb7a08d06790a
//Deliver partial version of schema
export default function graphqlModulesMerger(dir = x`dir`) {

  let moduleTypeDefinitions = [];
  let moduleResolvers = [];
  let moduleSubscriptions = [];

  let files = getGlobbedFiles(path.join(dir, "**", "*.graphql.js"));

  // Load schema files
  files.forEach((file) => {
    let moduleSchema = require(path.resolve(file));
    mergeData(moduleTypeDefinitions, moduleSchema.typeDefs);
    mergeData(moduleResolvers, moduleSchema.resolvers);
    mergeData(moduleSubscriptions, moduleSchema.subscriptions);
  });

  // --- MERGE TYPE DEFINITONS
  const schema = moduleTypeDefinitions.join("\n");

  return {Schema: {
    typeDefs: schema,
    resolvers: mergeModuleResolvers(moduleResolvers, {})
  }, Subscriptions: moduleSubscriptions};
};
