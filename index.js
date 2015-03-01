var request = require('request');
var cheerio = require('cheerio');
var db      = require('monk')('localhost/mydb');

var url = 'http://echo360-test.its.uwa.edu.au/echocontent/sections/';

request(url, function(error, response, html) {
    if (error) return;

    var $ = cheerio.load(html);

    $('td > a').each(function(index, element) {

        request(url + element.attribs.href + 'section.xml',
            function(error, response, html){

                if (error) return;

                var $ = cheerio.load(html);

                console.log($('term > name').text());
        });
    });
});
