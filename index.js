const fs = require('fs');
const { extname } = require('path');
const processZip = require('./src/process-zip.js');
const processFolder= require('./src/process-folder.js');

(async () => {
  const path = process.argv[2];
  if (!path) {
    console.log('Please provide either a .zip file or a relative directory path');
    process.exit(1);
  }
  if (extname(path) === '.zip') {
    await processZip(path);
  } else if (path.startsWith('./') && fs.lstatSync(path).isDirectory()) {
    await processFolder(path);
  }
})();
