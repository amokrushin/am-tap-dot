const { Transform } = require('stream');
const parser = require('tap-out');
const chalk = require('chalk');
const _ = require('lodash');

class AmTapeDot extends Transform {
    constructor(options) {
        super(options);

        this.options = _.defaultsDeep({}, options, {
            padding: '  ',
            dotsPerLine: 80,
            icon: {
                failure: chalk.red(process.platform === 'linux' ? '✘' : 'x'),
                success: chalk.green(process.platform === 'linux' ? '•' : '.'),
            },
            verbose: false,
        });

        this.parser = parser();
        this.extra = [];
        this.assertCount = 0;
        this.timestamp = Date.now();
        this.failed = false;

        let counter = 0;

        this.outLine();

        this.parser.on('assert', res => {
            if (counter === this.options.dotsPerLine) {
                this.outLine();
                counter = 0;
            }
            if (counter === 0) {
                this.outPush();
            }
            if (res.ok) {
                this.push(this.options.icon.success);
            } else {
                this.push(this.options.icon.failure);
                this.failed = true;
            }
            counter++;
            this.assertCount++;
        });

        this.parser.on('extra', str => {
            if (str !== '') this.extra.push(str);
        });

        this.on('dot-line-break', () => {
            counter = this.options.dotsPerLine;
        });

        this.on('finish', () => this.parser.end());
    }

    _transform(chunk, encoding, cb) {
        this.parser.write(chunk, encoding, cb);
    }

    _flush(callback) {
        this.parser.on('output', result => {
            if ((result.fail && result.fail.length) || this.assertCount === 0) {
                this.outSpacer(2);

                if (this.options.verbose) {
                    _(result.fail)
                        .map(a => _.defaults({ test: _.find(result.tests, ['number', a.test]) }, a))
                        .groupBy(a => a.test.number)
                        .forEach(test => {
                            const testName = test[0].test.name;
                            this.outLine(`${chalk.red('x')} ${chalk.underline(testName)}`);
                            _.forEach(test, assertion => {
                                this.outLine(`  ${chalk.red('-')} ${assertion.name}`);
                                this.outLine(`      expected: ${assertion.error.expected}`, 'gray');
                                this.outLine(`      actual: ${assertion.error.actual}`, 'gray');
                                const filepath = assertion.error.at.file;
                                const line = assertion.error.at.line;
                                const char = assertion.error.at.character;
                                this.outLine(`    at: ${filepath}:${line}:${char}`, 'gray');
                            });
                            this.outLine();
                        });
                    this.outLine();
                }


                this.outputExtra();
                this.statsOutput(result);
                this.outSpacer(2);
                this.outLine(chalk.red('Failed Tests: '));
                this.outLine();
                _(result.fail)
                    .map(a => _.defaults({ test: _.find(result.tests, ['number', a.test]) }, a))
                    .groupBy(a => a.test.number)
                    .forEach(test => {
                        const testName = test[0].test.name;
                        this.outLine(`${chalk.red('x')} ${chalk.underline(testName)}`);
                        this.outLine();
                        _.forEach(test, assertion => {
                            const shortPath = assertion.error.at.file.replace(/^.+test\//, '');
                            const at = `${shortPath}:${assertion.error.at.line}`;
                            this.outLine(`    ${chalk.red('-')} ${assertion.name} (${at})`, 'gray');
                        });
                        this.outLine();
                    });
                this.outLine();
            } else {
                this.outSpacer(2);
                this.statsOutput(result);
                this.outLine();
                this.outLine(`${chalk.green('Pass!')}`);
                this.outLine();
            }
            callback();
        });
    }

    outputExtra() {
        this.push(this.extra.join('\n'));
    }

    outPush(str = '', color = 'white') {
        this.push(`${this.options.padding}${chalk[color](str)}`);
    }

    outLine(str = '', color = 'white') {
        this.outPush(`${str}\n`, color);
    }

    outSpacer(num = 1) {
        this.push('\n'.repeat(num));
    }

    statsOutput(res) {
        const time = ((Date.now() - this.timestamp) / 1000).toFixed(2);
        const testTotal = res.tests.length;
        const testFail = _.uniq(_.map(res.fail, _.property('test'))).length;
        const testPass = testTotal - testFail;
        const assertTotal = res.asserts.length;
        const assertPass = res.pass.length;
        const assertFail = res.fail.length;

        this.outLine(`${testPass} of ${testTotal} tests passed`, 'gray');
        this.outLine(`${assertPass} of ${assertTotal} assertions passed`, 'gray');
        this.outLine();
        this.outLine(`${assertPass} passed (${time}s)`, 'green');
        if (assertFail) this.outLine(`${assertFail} failed`, 'red');
    }
}

module.exports = {
    AmTapeDot,
    amTapDot: (options) => new AmTapeDot(options),
};
