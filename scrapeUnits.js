/*
 * Scrapes UWA lecture capture system for Unit information
 * Retrieves unit codes, names, and unit hash id's.
 *
 * Distributed under the MIT License.
 * See http://opensource.org/licenses/MIT
 */

var async       = require('async');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var ProgressBar = require('progress');
var db          = require('monk')('localhost/uwadb');

var url   = 'http://echo360-test.its.uwa.edu.au/echocontent/sections/';

var units = db.get('units');
units.index("unit_hash", { unique: true });
units.index("identifier");

request(
    url,
    function(error, response, body) {
        if (error) {
            console.log("Error fetching " + url + "\nAborting.");
            return;
        }

        var $ = cheerio.load(body);
        var bar = new ProgressBar('Pulling [:bar] :current/:total :percent :eta', {total: $('td > a').length});

        async.eachLimit(
            $('td > a').toArray(),
            200,
            function(element, callback) {
                request(
                    url + element.attribs.href + 'section.xml',
                    function(error, response, body){
                        if (error) {
                            console.log(error + " on " + element.attribs.href);
                            bar.tick(1);
                            callback(null);
                            return;
                        }

                        var $ = cheerio.load(body, {xmlMode: true});

                        units.insert({
                            "name": $('course > name').text(),
                            "identifier": $('course > identifier').text(),
                            "unit_hash": $('section').attr('id'),
                            "term_ref" : $('term').attr('ref'),
                        });

                        bar.tick(1);
                        callback(null);
                    }
                );
            },
            function(error){
                if (error) console.log(error);
                db.close();
            }
        );
    }
);
