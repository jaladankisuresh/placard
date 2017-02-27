var moment = require('moment');

var eventBasicInfo = class EventBasicInfo {
  constructor(doc) {
    let self = this;
    var init = function() {
      self.day = moment(self.datetimestamp, 'MMM D YYYY, h:mm A').format('D');
      self.month = moment(self.datetimestamp, 'MMM D YYYY, h:mm A').format('MMM');
    };

    this.thumbnail = '';
    this.name = 'hosa cricket match';
    this.datetimestamp = moment().format('MMM D YYYY, h:mm A');
    this.location = 'hosa road junction, bangalore';
    this.sport = 'cricket';
    this.goingCount = 5;

    init();
  }
}

module.exports = eventBasicInfo;
