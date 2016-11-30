# am-tap-dot 
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/amokrushin/am-tap-dot/master/LICENSE)

Human-readable dots style TAP reporter

**Passed tests**
<p align="center">
    <img src="http://i.imgur.com/H22GKqW.png" alt="Passed tests"/>
</p>

**Failed tests**
<p align="center">
    <img src="http://i.imgur.com/jQd8NSH.png" alt="Failed tests"/>
</p>

## Install
 
```
# local
npm i am-tap-dot -D

# global
npm i am-tap-dot -g
```
 
## Usage

### Streaming

```js
const test = require('tape');
const { amTapDot } = require('am-tap-dot');

test.createStream()
    .pipe(amTapDot())
    .pipe(process.stdout);
```

### CLI

**package.json**

```json
{
  "name": "module-name",
  "scripts": {
    "test": "node ./test/tap-test.js | am-tap-dot"
  }
}
```

Then run with `npm test`
 
**Terminal**

```
tape test/index.js | node_modules/.bin/am-tap-dot
``` 
