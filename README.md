Promise runner for composing 'thenable' objects (or callbacks) in series and/or parallel sequences with labelled return values.

Initially motivated by the complications of using `Promise.all()` and maintaining readable code.

***********

To execute some Promises in parallel pass a plain object to `exec()`.  Under the hood `Promise.all()` is being invoked but here the result is an object with the values keyed as per the input:

````js
PromiseRun.exec({
    foo: fetch('http://foo.com'),
    bar: fetch('http://bar.com'),
    baz: fetch('http://baz.com'),
})
.then(function (values) {
    // values:
    // {
    //     foo: <HTML>,
    //     bar: <HTML>,
    //     baz: <HTML>,
    // }
})
````

To execute some Promises sequentially in series pass an array to `exec()`:

````js
PromiseRun.exec([
    Promise.resolve('first'),
    Promise.resolve('second'),
    function (resolve, reject) {
        resolve('third')
    }
])
.then(function (values) {
    // values:
    // {
    //     '0': 'first',
    //     '1': 'second',
    //     '2': 'third',
    // }
})
````

Any combination of series or parallel execution can be composed by passing plain objects or arrays. Here the series arguments are given labels by using a `[label, thenable]` format:

````js
PromiseRun.exec([
    ['first', Promise.resolve('first')],
    ['parallel fetch', {
        foo: function (resolve, reject) {
            // async op...
            resolve('foo');
        },
        bar: function (resolve, reject) {
            // async op...
            resolve('bar');
        },
        baz: function (resolve, reject) {
            // async op...
            resolve('baz');
        }
    }],
    ['and finally', Promise.resolve('all done')],
])
.then(function (values) {
    // values:
    // {
    //     first: 'first',
    //     'parallel fetch': {
    //         foo: 'foo',
    //         bar: 'bar',
    //         baz: 'baz',
    //     },
    //     'and finally': 'all done',
    // }
})
````
