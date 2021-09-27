# math.js

```js
// 高精度浮点运算
var mathjs = require('mathjs')

const math = mathjs.create(mathjs.all, { number: 'BigNumber' })

console.log(math.evaluate('0.1+0.2')) // 0.3
```
