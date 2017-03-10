var opentype = require('opentype.js');
var robotoFont = opentype.loadSync('./assets/fonts/Roboto-Black.ttf');

// NOTE: Currently we are only supporting computeTextSize() on Roboto font only
var textParserCtrl = {
  computeTextSize : function(val) {
    let text = {
      value : (typeof val === 'string') ? val : val.value,
      fontSize : val.fontSize || 14,
      fontFamily : val.fontFamily || 'Roboto'
    };

    let stringPath = robotoFont.getPath(text.value, 0, 0, text.fontSize);
    return stringPath.getBoundingBox();
  },
  getFontStyle : function(xmlNode) {
    var isNumber = function(value) {
        return !Number.isNaN(Number(value));
    };
    let elemStyle = {};
    let propStrArr = xmlNode.getAttribute('style').split(';');
    for(let item of propStrArr) {
      let trimItem = item.trim();
      if(trimItem.length === 0) continue;
      let keyVal = trimItem.split(':', 2);
      let trimKey = keyVal[0].trim();
      let trimVal = keyVal[1].trim();
      if(isNumber(trimVal)) {
        elemStyle[trimKey] = Number(trimVal);
      }
      else {
        elemStyle[trimKey] = trimVal;
      }
    }
    return { fontSize : elemStyle['font-size'] || 14, fontFamily : elemStyle['font-family'] || 'Roboto'};
  },
  measureText : function (yogaNode, xmlNode) {
    return function(width, widthMode, height, heightMode) {
      let textVal = Object.assign({}, {value : xmlNode.textContent}, textParserCtrl.getFontStyle(xmlNode));
      let textBBox = textParserCtrl.computeTextSize(textVal);
      //check why y1 values are negative in BoundingBox
      return { width: Math.ceil(textBBox.x2 - textBBox.x1), height: Math.ceil(textBBox.y2 - textBBox.y1) };
    };
  }
};

module.exports = textParserCtrl;
