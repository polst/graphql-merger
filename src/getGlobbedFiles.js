import glob from 'glob';

//https://gist.github.com/nishant8BITS/f4ce80ce3e976f7532b3
export default function getGlobbedFiles(globPatterns, removeRoot) {
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