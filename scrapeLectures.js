/*
 * Scrapes UWA lecture capture system for Unit information
 * Retrieves unit codes, names, and unit hash id's.
 *
 * Distributed under the MIT License.
 * See http://opensource.org/licenses/MIT
 */

var net         = require('net');
var async       = require('async');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var ProgressBar = require('progress');
var URL         = require('url');
var db          = require('monk')(process.env.MONGOLAB_URI || 'localhost/uwadb');
var units       = db.get('units');
var lectures    = db.get('lectures');

lectures.index("section.uuid", { unique: true });

var url         = 'http://prod.lcs.uwa.edu.au:8080';
var term_ref    = '21ae9073-1323-46bf-8bfe-a6b44a804018'; //term_ref for 2015.
var api_token   = '39f4f9968844d9cd4a0d4d46c7e4012f1b4781f1822c35fa141ea0141ccd96a8b57969f1682e722cfba84788735907588ac992131a161f66493bacd7ae32396b64b4cc679ed9e659f02c06133ac0c1369185a983b19aa7ae6031d6beb987ae70254d0da67b0d00d182d600d3ed83a78a13a967d39325d4c2fd77292d24b106080b15e89c00913e1e';
var user_agent  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:30.0) Gecko/20100101 Firefox/30.0';


//For each of the input unit codes, e.g. CITS1001, CITS1002, etc
//Up to 10 at a time
async.eachLimit(
    process.argv.slice(2),
    10,
    function(element, callback) {
        //Pull the information we already gathered out of mongodb
        units.findOne(
            {identifier: element, term_ref: term_ref},
            function(error, doc) {
                if (error) callback(error);

                //Couldn't get a valid cookie using the request library, unable to determine why
                //Dumping the packet locally using netcat and then mirroring it with netcat gives a valied cookie
                //Maybe something to do with the way request handles sockets???
                //Use raw sockets instead
                net.createConnection(8080, 'prod.lcs.uwa.edu.au').on('connect', function() {
                    this.write(
                        'GET /ess/client/section/'
                        + doc.unit_hash
                        + '?apiUrl=https://prodadmin.lcs.uwa.edu.au:8443/ess&userID=anonymousUser&token='
                        + api_token
                        + '&contentBaseUri=http://prod.lcs.uwa.edu.au:8080/ess HTTP/1.0\r\n\r\n'
                    );
                }).on('data', function(data) {
                    request(
                        {
                            url: url
                                + '/ess/client/api/sections/'
                                + doc.unit_hash
                                + '/section-data.json?'
                                + 'callback=EC.loadSectionData&pageIndex=1&pageSize=200&timeZone=Australia/Perth',
                            headers: {
                                //Pull the session cookie out of the returned data
                                'Cookie': data.toString('utf8').match(/(JSESSIONID=\w+)/)[0],
                            }
                        },
                        function(error, response, body) {
                            if (error) callback(error);

                            var lecture = JSON.parse(body.substring(19, body.length - 2));

                            lectures.update(
                                { 'section.uuid' : lecture.section.uuid },
                                lecture,
                                {upsert: true},
                                function(error, doc){
                                    callback(error);
                                }
                            );
                        }
                    );
                });
            }
        );
    },
    function(error) {
        db.close();


        if (error) {
            console.log(error);
            process.exit(1);
        }
    }
)
