var mathjs = require('mathjs')

const math = mathjs.create(mathjs.all, { number: 'BigNumber' })

const parser = math.parser()

function ua(arr) {
    let n = arr._data.length

    let t_factor = [0, 0, 1.84, 1.32, 1.20, 1.14]
    let t;
    if (n < 6) {
        t = t_factor[n]
    } else {
        t = 1;
    }

    let avernum = mathjs.mean(arr);
    let s = 0   //残差平方之和
    for (const v of arr._data) {
        s += mathjs.pow(v - avernum, 2)
    }

    let sx = mathjs.sqrt(s / ((n - 1) * n)) * t
    return sx
}

parser.set('ua', ua);
console.log(parser.evaluate('ua([1.5206,1.5286,1.5250,1.5180,1.5240])'));

(function (arr) { let arr_r = []; for (let i = 0; i < 5; i++) { arr_r.push(arr[i] - arr[i + 5]); } return arr_r; })([
    11.899104999999999,
    12.018880000000003,
    12.122079999999997,
    11.824424000000004,
    11.848256
])