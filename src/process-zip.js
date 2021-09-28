const admZip = require('adm-zip');
const { dirname, basename } = require('path');
const fixXml = require('./fix-xml.js');

const dirStartsWith = (dir, arr) => {
  let ret = false;
  arr.forEach(item => {
    if (dir.startsWith(item)) {
      ret = true;
    }
  })
  return ret;
};

module.exports = async (path) => {
  const originalZip = new admZip(path);
  const newZip = new admZip();

  const templateXML = originalZip.getEntries().filter(entry => entry.entryName == 'templateDetails.xml');
  const newData = await fixXml(templateXML[0].getData().toString('utf8'));
  if (Object(newData) !== newData) {
    console.log('Error fixing XML');
    process.exit(1)
  }

  if (newData.inheritable === true) {
    console.log('The provided template has already the inheritable tag!!!');
  }
  newZip.addFile('_media_assets_/', Buffer.alloc(0));

  originalZip.getEntries().forEach(entry => {
    if (!entry.isDirectory) {
      switch (dirname(entry.entryName).split('/')[0]) {
        case 'images':
        case 'imgs':
        case 'img':
          let newName = entry.entryName;
          if (entry.entryName.startsWith('img/')) {
            newName = entry.entryName.replace('img/', '_media_assets_/images/')
          }
          if (entry.entryName.startsWith('imgs/')) {
            newName = entry.entryName.replace('imgs/', '_media_assets_/images/')
          }
          if (entry.entryName.startsWith('images/')) {
            newName = entry.entryName.replace('images/', '_media_assets_/images/')
          }
          newZip.addFile(newName, entry.getData());
          break;
        case 'scss':
          newZip.addFile(entry.entryName.replace('scss/', '_media_assets_/scss/'), entry.getData());
          break;
        case 'css':
          newZip.addFile(entry.entryName.replace('css/', '_media_assets_/css/'), entry.getData());
          break;
        case 'less':
          newZip.addFile(entry.entryName.replace('less/', '_media_assets_/less/'), entry.getData());
          break;
        case 'js':
          newZip.addFile(entry.entryName.replace('js/', '_media_assets_/js/'), entry.getData());
          break;
        default:
          let newNameStd = entry.entryName;
          if (['template_preview.png', 'template_thumbnail.png'].includes(entry.entryName)) {
            newNameStd = `_media_assets_/images/${entry.entryName}`;
          }
          newZip.addFile(newNameStd, entry.getData());
          break;
      }
    } else if (entry.isDirectory && entry.entryName.endsWith('/')) {
      if (dirStartsWith(entry.entryName, ['less/', 'scss/', 'fonts/', 'imgs/', 'images/', 'css/', 'js/'])) {
        newZip.addFile(`_media_assets_/${entry.entryName}/`, entry.getData());
      } else {
        newZip.addFile(entry.entryName, entry.getData());
      }
    }
  });

  // Update the templateDetails.xml
  newZip.updateFile('templateDetails.xml', newData.xml);

  await newZip.writeZipPromise(`inheritable_${path}`);
}

