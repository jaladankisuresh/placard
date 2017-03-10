var matchSide = class MatchSide {
  constructor(side) {
    this.thumbnail = side.thumbnail;
    this.name = side.name || 'Side Name';
    this.members = side.members;
  }
};

module.exports = matchSide;
