var fs = require('fs');
var Mustache = require('mustache');
var gm = require('gm').subClass({imageMagick: true});
var models = require('./models/models');

let matchInfo = new models.EventBasicInfo();
let match = new models.Match(matchInfo);
match.addSide(0, new models.MatchSide());
match.addSide(1, new models.MatchSide());


let template = fs.readFileSync('assets/template.svg', 'utf-8');
let svgBuffer = Buffer.from(Mustache.render(template, match), 'utf8');

gm(svgBuffer, 'input.svg')
  .write('out.png', function(err) {
  if (err) {
    return console.log(err);
  }
    console.log('image converted.');
});
