#!/usr/bin/env node

const { amTapDot } = require('../');

const stream = amTapDot();

process.stdin
    .pipe(stream)
    .pipe(process.stdout);

process.on('exit', status => {
    if (status === 1) {
        process.exit(1);
    }
    if (stream.failed) {
        process.exit(1);
    }
});
