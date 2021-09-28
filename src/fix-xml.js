const { xml2json, json2xml } = require('xml-js');
const { extname } = require('path');

const sanitise = (value) => value.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;');
const toString = (input) => json2xml(input, {compact: false, spaces: 2, attributeValueFn: sanitise }); // indentAttributes: true,

module.exports = async (originalXML) => {
  let isInherritable = false;
  const staticAssets = [];
  let resultJson;
  let isSite = true;
  let templateName;

  try {
    resultJson = JSON.parse(xml2json(originalXML));
  } catch (error) {
    console.log('Your XML file is not valid.');
    process.exit(1)
  }

  if (resultJson && resultJson === Object(resultJson) && resultJson.elements && Array.isArray(resultJson.elements) && resultJson.elements[0].elements) {
    const inherritable = resultJson.elements[0].elements.filter(el => el.name === 'inheritable');
    isSite = resultJson.elements[0].attributes.client === 'site';
    templateName = resultJson.elements[0].elements.filter(el => el.name === 'name')[0].elements[0].text
    if (inherritable.length && inherritable[0] && inherritable[0].elements[0].text === '1') {
      isInherritable = true;

      const mediaPos = resultJson.elements[0].elements.findIndex(el => el.name === 'media');
      resultJson.elements[0].elements[mediaPos].attributes = { destination: `templates/${isSite ? 'site' : 'administrator'}/${templateName}`, folder: '_media_assets_'};
      return {
        isInherritable,
        xml: toString(resultJson),
        isSite,
        templateName,
      };
    }

    resultJson.elements[0].elements.forEach((grandParent, id1) => {
      if (grandParent.name === 'inheritable') {

      }
      if (grandParent.name === 'files') {
        grandParent.elements.forEach((parent) => {
          parent.elements.forEach((child) => {
            if (!['filename', 'folder'].includes(parent.name)) return;
            if (parent.name === 'filename') {
              const ext = extname(child.text)
              if (['.png', '.ico', '.svg', '.jpg', '.jpeg', '.css', 'js'].includes(ext)) {
                resultJson.elements[0].elements[id1].elements = resultJson.elements[0].elements[id1].elements.filter(el => el.elements[0].text !== child.text);
                return;
              }
            } else if (parent.name === 'folder' && ['css', 'js', 'images', 'scss', 'sass', 'less', 'img', 'fonts', 'static', 'assets', 'media_src', 'media'].includes(child.text)) {
              staticAssets.push({ type: 'element', name: 'folder', elements: [ { type: 'text', text: child.text } ] });
              resultJson.elements[0].elements[id1].elements = resultJson.elements[0].elements[id1].elements.filter(el => el.elements[0].text !== child.text);
            }
          });
        });
      }
    });

    const filesPosition = resultJson.elements[0].elements.findIndex(element => element.name === 'files');
      resultJson.elements[0].elements.splice(filesPosition + 1, 0, { type: 'element', name: 'media', attributes: { destination: `templates/${isSite ? 'site' : 'administrator'}/${templateName}`, folder: '_media_assets_'}, elements: staticAssets });
    if (!isInherritable) {
      resultJson.elements[0].elements.splice(filesPosition, 0, { type: 'element', name: 'inheritable', elements: [ { type: 'text', text: 1 } ] })
    }
  }

  return {
    isInherritable,
    xml: toString(resultJson),
    isSite,
    templateName,
  };
};
