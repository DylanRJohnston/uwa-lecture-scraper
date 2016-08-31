require! 'co'

export main = (func) -> co ->*
    try
        yield from func!
    catch {stack}
        process.stderr.write stack
