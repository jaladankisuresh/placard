var fs = require('fs');
var Mustache = require('mustache');
var DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer;
var svg2png = require('svg2png');
var gm = require('gm').subClass({imageMagick: true});
var moment = require('moment');
var placard = require('./library');
var models = require('./models');

let eventBasicData = {
  name : 'Smileys Icons from FlatIcon',
  thumbnail : './assets/icons/nerd.png',
  datetime : 'Mar 2 2017, 9:15 AM',
  location : 'FlatIcon.com',
  sport : 'Make Smileys',
  goingList : [
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'},
    {img: './assets/icons/happy.png'}
  ]
};
let matchInfo = new models.EventBasicInfo(eventBasicData);
let match = new models.Match(matchInfo);
match.addSide(0, new models.MatchSide({name : 'Side A'}));
match.addSide(1, new models.MatchSide({name : 'Side B'}));

let layoutSVGTemplate = fs.readFileSync('templates/layout-template.svg', 'utf-8');
let svgContentString  = Mustache.render(layoutSVGTemplate, match);
var xmlDoc = new DOMParser().parseFromString(svgContentString,'text/xml');
placard.svgTemplatingCtrl.requestYogaLayout(xmlDoc);
let svgLayoutCompleteString = new XMLSerializer().serializeToString(xmlDoc);
fs.writeFile('isupport-layouts.svg', svgLayoutCompleteString, function() {
  console.log('output svg written to out.svg');
});

svg2png(svgLayoutCompleteString)
  .then(buffer => {
    fs.writeFileSync("isupport-layouts.png", buffer);
    console.log('image converted.');
  })
  .catch(e => console.error(e));


/*
 Hello SVG Example
let helloSVGTemplate = fs.readFileSync('templates/hello-svg-template.svg', 'utf-8');
let svgContentString  = Mustache.render(helloSVGTemplate, {name : 'SVG'});
var xmlDoc = new DOMParser().parseFromString(svgContentString,'text/xml');
placard.svgTemplatingCtrl.requestYogaLayout(xmlDoc);
let svgLayoutCompleteString = new XMLSerializer().serializeToString(xmlDoc);
fs.writeFile('hello-svg.svg', svgLayoutCompleteString, function() {
  console.log('output svg written to out.svg');
});

// node.js module that converts svg to png using ImageMagick library
let svgLayoutCompleteBuffer = Buffer.from(svgLayoutCompleteString);
gm(svgLayoutCompleteBuffer)
.font('./assets/fonts/Roboto-Black.ttf')
.write('hello-svg.png', function(err) {
  if (err) {
    return console.log(err);
  }
    console.log('image converted.');
});

// node.js module that converts svg to png using phantomjs
svg2png(svgLayoutCompleteString)
  .then(buffer => {
    fs.writeFileSync("isupport-layouts.png", buffer);
    console.log('image converted.');
  })
  .catch(e => console.error(e));
*/
