var moment = require('moment');

var eventBasicInfo = class EventBasicInfo {
  constructor(event) {
    let self = this;
    var init = function() {
      self.day = moment(self.datetime, 'MMM D YYYY, h:mm A').format('D');
      self.month = moment(self.datetime, 'MMM D YYYY, h:mm A').format('MMM').toUpperCase();
    };

    this.thumbnail = event.thumbnail;
    this.name = event.name || 'Event Name';
    this.datetime = event.datetime || moment().format('MMM D YYYY, h:mm A');
    this.location = event.location || 'Event Location';
    this.sport =  (event.sport || 'cricket').toUpperCase();
    this.goingList = event.goingList;
    init();
  }
};

module.exports = eventBasicInfo;
