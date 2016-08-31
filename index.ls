require! {
    'progress'          : ProgressBar
    'cheerio'           : { load: parseHTML }
    'prelude-ls'        : { map, drop, take }
    './lib/co.ls'       : { main }
    './lib/request.ls'  : { request }
    './lib/fs.ls'       : { writeFile }
}

unitsIndex = 'http://echo360-test.its.uwa.edu.au/echocontent/sections/'

getUnit = (tick, url) -->*
    {body} = yield request url: "#{unitsIndex}#{url}section.xml"

    tick!

    $ = parseHTML body, xmlMode: true

    unit =
        name:       $ 'section > name'      .text!
        identifier: $ 'course > identifier' .text!
        portal_url: $ 'portal > url'        .text!
        unit_hash:  $ 'section'             .attr 'id'
        course_ref: $ 'course'              .attr 'ref'
        term_ref:   $ 'term'                .attr 'ref'

main ->*
    process.stdout.write "Fetching unit index... "
    {body} = yield request url: unitsIndex
    process.stdout.write "Done!\n"

    unitHashes = 'td > a'
        |> parseHTML body
        |> (.toArray!)
        |> map (.attribs?.href)
        |> drop 1

    bar = new ProgressBar 'ETA :etas [:bar] :current/:total',
        total: unitHashes.length

    units = yield unitHashes |> map getUnit (-> bar.tick 1)

    yield writeFile 'units.json', JSON.stringify units
