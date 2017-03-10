var EventBasicInfo = require('./eventBasicInfo');
var MatchSide = require('./matchSide');

var match = class Match {
  constructor(doc) {
    this.info = doc;
  }

  addSide(sideIndex, doc) {
    switch(sideIndex){
      case 0:
        this.sideA = doc;
        break;
      case 1:
        this.sideB = doc;
        break;
      default:
        return;
    }
  }
};

module.exports = match;
