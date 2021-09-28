const admZip = require('adm-zip');
const { readFile, readdir } = require('fs').promises;
const { basename, extname } = require('path');
const fixXml = require('./fix-xml.js');

module.exports = async (path) => {
    if (!fs.existsSync(`${path}/templateDetails.xml`)) {
      console.log('No valid template XML file found! Exiting..');
      process.exit(1)
    }
    const templateXML = await readFile(`${path}/templateDetails.xml`, {encoding: 'utf8'});
    const newData = await fixXml(templateXML);
    if (Object(newData) !== newData) {
      console.log('Error fixing XML');
      process.exit(1)
    }

    const newZip = new admZip();

    if (newData.inheritable === true) {
      console.log('The provided template has already the inheritable tag!!!');
    } else {
      newZip.updateFile('templateDetails.xml', newData.xml);
    }

    //{ destination: `templates/${isSite ? 'site' : 'administrator'}/${templateName}`, folder: '_media_assets_'}
    newZip.addFile('_media_assets_/', Buffer.alloc(0));

    const files = await readdir(`${path}/`, {encoding: 'utf8', withFileTypes: true, withFullPath: false});

    files.forEach(file => {
      if (file.isFile()) {
        if (['.png', '.ico', '.svg', '.jpg', '.jpeg', '.css', '.js'].includes(extname(file.name))) {
          switch (extname(file.name)) {
            case '.png':
            case '.ico':
            case '.svg':
            case '.jpg':
            case '.jpeg':
              newZip.addFile(`_media_assets_/images/${file.name}`, fs.readFileSync(`${path}/${file.name}`));
              break;
            case '.css':
              newZip.addFile(`_media_assets_/css/${file.name}`, fs.readFileSync(`${path}/${file.name}`));
              break;
            case '.js':
              newZip.addFile(`_media_assets_/js/${file.name}`, fs.readFileSync(`${path}/${file.name}`));
              break;
            default: break;
          }
        } else {
          newZip.addFile(file.name, fs.readFileSync(`${path}/${file.name}`));
        }
      } else if (fs.lstatSync(path).isDirectory()) {
        if (['less', 'scss', 'fonts', 'imgs', 'images', 'css', 'js'].includes(file.name)) {
          newZip.addLocalFolder(`${path}/${file.name}`, `_media_assets_/${file.name}/`);
        } else {
          newZip.addLocalFolder(`${path}/${file.name}`, `${file.name}/`);
        }
      }
    });
    await newZip.writeZipPromise(`${path}/inheritable_${basename(path)}.zip`);
}

