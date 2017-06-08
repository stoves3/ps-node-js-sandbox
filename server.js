var $;

import express from 'express';
import bodyParser from 'body-parser';
import cheerio from 'cheerio';
import request from 'request';
var app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', function(req, responseText) {  
  var textContent = req.body.Body;
  console.log(req.body);
  
  var hasContent = textContent != undefined && textContent.length > 0;
  var tweetRequested = hasContent && textContent[0] == '@';
  var startPlaying = hasContent && textContent.length > 2 && textContent == 'wnd';
  var keepPlaying = hasContent && textContent.length > 2 && textContent.substring(0,4) == 'wnd_';
  
  var fromPhone = req.body.From;
  
  if (tweetRequested){
    request('http://twitter.com/' + req.body.Body, function(err, res, body) {
        $ = cheerio.load(body);
        var firstItem = $('ol.stream-items').children().first();
        var tweetContent = firstItem.find('.tweet-text').text();
        responseText.send('<Response><Message>' + tweetContent + '</Message></Response>');
    });
  } else if (startPlaying || keepPlaying){
     playGame(startPlaying, req, responseText);
  } else {
    responseText.send('<Response><Message>' + textContent + '</Message></Response>');    
  }
});

var playGame = function (starting, req, responseText) {    
    var command = !starting ? req.body.Body : 'wnd_go';
 
    request('http://twitter.com/' + command, function(err, res, body) {
        $ = cheerio.load(body);
        var firstItem = $('ol.stream-items').children().first();
        var tweetContent = firstItem.find('.tweet-text').text();
    
        if(starting) tweetContent = 'Welcome to the adventure. Respond with "wnd_run" or "wnd_hide" to continue \n\n' + tweetContent;
    
        responseText.send('<Response><Message>' + tweetContent + '</Message></Response>');
    });
};

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
