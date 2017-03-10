var fs = require('fs');
var Yoga = require('yoga-layout');
var textParserCtrl = require('./textParserCtrl');

const SVG_DEFAULT_WIDTH = 1200, SVG_DEFAULT_HEIGHT = 630;

var svgTemplatingCtrl = {
  buildLayoutTree : function(xmlNode) { // buildLayoutTree() takes element Nodes as paramter to generate hybrid node tree containing xmlNode and YogaNode.
                                    //check return value for return data type
    var setYogaNodeStyle = function(yogaNode, xmlNode) {
      let style = svgTemplatingCtrl.parseXMLNodeStyle(xmlNode);

      var isAlphabeticalString = function(propVal) { // convert AlphabeticalString to enum, as expected by Yoga-layout
        if(typeof propVal !== 'string') return false;

        // validate if the string is aplhanumeric like '100px', '50%'
        for (let charIndex = 0; charIndex < propVal.length; charIndex++) {
          let code = propVal.charCodeAt(charIndex);
          //if ( !(code > 64 && code < 91) && !(code > 96 && code < 123) && (code !== 45)) return false; // not upper alpha (A-Z) nor lower alpha (a-z) nor (-)
          if (code > 47 && code < 58) return false; // if numeric (0-9)
        }
        return true;
      };
      var getFnName = function(propFnVal) {
        if(propFnVal.indexOf('-') === -1) {
          return 'set' + propFnVal.charAt(0).toUpperCase() + propFnVal.substring(1);
        }

        let sPartArr = [];
        for(let sPart of propFnVal.split('-')) {
          sPartArr.push(sPart.charAt(0).toUpperCase() + sPart.substring(1));
        }
        return 'set' + sPartArr.join('');
      };
      var getFnValue = function(prop) {
        if(!isAlphabeticalString(style[prop])) return style[prop];

        let propValPattern = style[prop].replace(/-/g, '_').toUpperCase();

        // seperate logic for exception list
        //1. flexWrap
        switch(prop) {
          case 'flex-wrap':
            return Yoga['WRAP_' + propValPattern];
          case 'justify-content':
            return Yoga['JUSTIFY_' + propValPattern];
          case 'align-items':
          case 'align-self':
            return Yoga['ALIGN_' + propValPattern];
        }

        // Else logic
        let propPattern = prop.replace(/-/g, '_').toUpperCase();
        return Yoga[propPattern.concat('_', propValPattern)];
      };

      for (let prop in style) {
        let canPropHaveEdge = false, propEdge = -1;
        let propPrimary = prop.indexOf('-') > -1 ? prop.substring(0, prop.indexOf('-')) : prop;
        switch(propPrimary) {
          case 'position':
          case 'margin':
          case 'padding':
          case 'border':
            canPropHaveEdge = true;
            break;
        }
        if(canPropHaveEdge) {
          if(prop.indexOf('-') === -1) {
            propEdge = Yoga.EDGE_ALL;
          }
          else {
            //check if the style prop has left, right, top or bottom suffix. ex: padding-left, margin-top, border-right
                //NOTE: this is logic doesnt takes in assumption that we have only have css style with 1 '-' colon in between
            let hyphenSuffix = prop.substring(prop.indexOf('-') + 1);
            switch (hyphenSuffix) {
              case 'left':
              case 'right':
              case 'top':
              case 'bottom':
              case 'start':
              case 'end':
              case 'horizontal':
              case 'vertical':
                propEdge = Yoga['EDGE_' + hyphenSuffix.toUpperCase()];
                break;
            }
          }
        }

        if (propEdge > -1) {
          //console.log('yogaNode.' + getFnName(propPrimary) + '(' + propEdge + ',' + getFnValue(prop) +')');
          yogaNode[getFnName(propPrimary)](propEdge, getFnValue(prop));
        }
        else {
          //console.log('yogaNode.' + getFnName(prop) + '(' + getFnValue(prop) +')');
          yogaNode[getFnName(prop)](getFnValue(prop));
        }
      }
      //set special YogaNodeStyles by tagName
      switch(xmlNode.tagName) {
        case 'text':
          yogaNode.setMeasureFunc(textParserCtrl.measureText(yogaNode, xmlNode));
          yogaNode.markDirty();
          break;
      }
    };
    var getXMLChildNodes = function(el) {
      var children = [];
      for (let index = 0, childPosition = 0; index < el.childNodes.length; index++) {
        let child = el.childNodes[index];
        if(child.nodeType === 1) { //1	ELEMENT_NODE
          let hybridChildNode = svgTemplatingCtrl.buildLayoutTree(child);
          yogaNode.insertChild(hybridChildNode.yogaNode, childPosition++);
          children.push(hybridChildNode);
        }
      }
      return children;
    };

    let yogaNode = Yoga.Node.create();
    setYogaNodeStyle(yogaNode, xmlNode);
    return {
      xmlElement : xmlNode,
      yogaNode : yogaNode,
      children: getXMLChildNodes(xmlNode)
    };
  },
  applyStylesToLayoutTree : function(hybridNode) { // applyStylesToLayoutTree() takes value returned by buildLayoutTree() function
    for (let index = 0; index < hybridNode.children.length; index++) {
      let child = hybridNode.children[index];
      svgTemplatingCtrl.applyStylesToLayoutTree(child);
    }
    if(!hybridNode.xmlElement.getAttribute('x'))
      hybridNode.xmlElement.setAttribute('x', hybridNode.yogaNode.getComputedLeft());
    //Note: ugly code, needs to be corrected. there seems to be an issue with getting expected Y value for <text> nodes
    if(!hybridNode.xmlElement.getAttribute('y')) {
      if(hybridNode.xmlElement.tagName === 'text') {
        let fontStyle = textParserCtrl.getFontStyle(hybridNode.xmlElement);
        let adjustedYVal = hybridNode.yogaNode.getComputedTop() + fontStyle.fontSize;
        hybridNode.xmlElement.setAttribute('y', adjustedYVal);
      }
      else {
        hybridNode.xmlElement.setAttribute('y', hybridNode.yogaNode.getComputedTop());
      }
    }
    if(!hybridNode.xmlElement.getAttribute('width'))
      hybridNode.xmlElement.setAttribute('width', hybridNode.yogaNode.getComputedWidth());
    if(!hybridNode.xmlElement.getAttribute('height'))
      hybridNode.xmlElement.setAttribute('height', hybridNode.yogaNode.getComputedHeight());
  },
  parseXMLNodeStyle : function(xmlNode) {
    var isNumber = function(value) {
        return !Number.isNaN(Number(value));
    };
    let elemStyle = {};
    let propStrArr = xmlNode.getAttribute('flex-css').split(';');
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
    return elemStyle;
  },
  requestYogaLayout : function(xmlDoc) {
    // Get first <svg> element by TagName
    let svgElem = xmlDoc.getElementsByTagName('svg')[0];
    //check if the svgElem has width and height defined in 'flex-css' attribute
    let svgCssStyle = svgTemplatingCtrl.parseXMLNodeStyle(svgElem);
    if(!svgCssStyle.width) { // set default width
      svgElem.setAttribute('flex-css', svgElem.getAttribute('flex-css').concat(';width:', SVG_DEFAULT_WIDTH));
    }
    if(!svgCssStyle.height) { // set default height
      svgElem.setAttribute('flex-css', svgElem.getAttribute('flex-css').concat(';height:', SVG_DEFAULT_HEIGHT));
    }

    let layoutTree = svgTemplatingCtrl.buildLayoutTree(svgElem);
    layoutTree.yogaNode.calculateLayout(Yoga.UNDEFINED, Yoga.UNDEFINED, Yoga.DIRECTION_LTR);
    svgTemplatingCtrl.applyStylesToLayoutTree(layoutTree);

    layoutTree.yogaNode.freeRecursive();
  }
};

module.exports = svgTemplatingCtrl;
