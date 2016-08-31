require! {
    \fs
    'prelude-ls'    : { map, filter }
}

export writeFile = (...args) ->
    resolve, reject <- new Promise _
    error           <- fs.writeFile ...args

    if error? then reject error
    else      then resolve true
