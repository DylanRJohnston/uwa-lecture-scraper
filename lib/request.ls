# A promisified, per domain rate limited wrapper around the request library
require! {
    \url                    : { parse }
    \request                : requestUnlimited
    'simple-rate-limiter'   : limit
}
requestUnlimited .= defaults jar: true

limits = to: 100, per: 10000, evenly: true, fuzz: 0.1

process.stdout.write """
    Network request limits set to:

        Frequency:  #{limits.to}/#{limits.per}ms
        Fuzziness:  #{limits.fuzz}
        Evenly:     #{limits.evenly}


"""

hosts = {}
export request = (args) ->
    resolve, reject <- new Promise _

    host = parse args.url ?.host
    hosts[host] = limit requestUnlimited
        .to limits.to
        .per limits.per
        .evenly limits.evenly
        .withFuzz limits.fuzz unless hosts[host]?

    error, data <- hosts[host] args

    if error? then reject error
    else      then resolve data
