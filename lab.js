const mathjs = require('mathjs')
const math = mathjs.create(mathjs.all, { number: 'BigNumber' })

const fs = require('fs')

experiment = JSON.parse(fs.readFileSync('./labs/平凸透镜曲率半径的测量.json', 'utf8'))

// std_input = { 'f_0': 98 }
std_input = {}



function smartlab_ua(arr) {
    let n = arr.length

    let t_factor = [0, 0, 1.84, 1.32, 1.20, 1.14]
    let t;
    if (n < 6) {
        t = t_factor[n]
    } else {
        t = 1;
    }

    let avernum = mathjs.mean(arr);
    let s = 0 //残差平方之和
    for (const v of  arr) {
        s += mathjs.pow(v - avernum, 2)
    }

    let sx = mathjs.sqrt(s / ((n - 1) * n)) * t
    return sx
}

function smartlab_u(arr, uncertainty_yq) {
    let uncertainty_a = smartlab_ua(arr);
    return Math.sqrt(Math.pow(uncertainty_a, 2) + Math.pow(uncertainty_yq, 2) / 6)
}



function process_input(logic, std_input) {

    let variables = logic['variables']
    let functions = logic['functions']

    const parser = math.parser()

    parser.set('smartlab_g', math.bignumber(9.8));

    parser.set('smartlab_ua', smartlab_ua);
    parser.set('smartlab_u', smartlab_u);

    for (let fName in functions) {
        parser.set(fName, eval(functions[fName]))
    }

    for (let x of variables) {
        // console.log('x', x);
        switch (x['source']['type']) {
            case 'input':
                if (x['name'] in std_input) {
                    x['value'] = std_input[x['name']]
                } else {
                    x['value'] = x['source']['default']
                }
                break;
            case 'mathjs':
                x['value'] = parser.evaluate(x['source']['expression'])
                break;
            case 'mathjs-suffix':
                let x_name = x['name']
                let pos = x_name.lastIndexOf('_');

                let name = x_name.slice(0, pos);
                let fun = x_name.slice(pos + 1, x_name.length);

                let expression = '';
                switch (fun) {
                    case 'a':
                        expression = `mean(${name})`
                        break
                    case 'ua':
                        expression = `smartlab_ua(${name})`
                        break
                    default:
                        console.error('mathjs-suffix: unsupport fun', x)
                }
                x['value'] = parser.evaluate(expression)
                break;
            default:
                console.error('unsupport source type', x)
        };

        if (typeof x['value'] != "string") {
            parser.set(x['name'], math.bignumber(x['value']))
        } else {
            parser.set(x['name'], x['value'])
        }
    }
}

process_input(experiment['logic'], std_input)

console.log(experiment['logic']['variables']);

// console.log(JSON.stringify(experiment, null, 4))
