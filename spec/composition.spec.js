if (typeof process !== 'undefined' && process.title === 'node') {
    PromiseRun = require('../promise-run.js');
}

describe('Composing', function () {

    it('series run with nested parallel runs', function (done) {

        PromiseRun.series([
            function (resolve, reject) {
                resolve('first');
            },
            ['parallel', {
                foo: Promise.resolve('ok'),
                bar: Promise.resolve('ok'),
            }],
            {
                foo: Promise.resolve('#'),
            },
            Promise.resolve('#'),
            ['and finally', function (resolve, reject) {
                resolve('all done');
            }]
        ])
        .then(function (values) {
            expect(values).toEqual({
                '0': 'first',
                'parallel': {
                    foo: 'ok',
                    bar: 'ok',
                },
                '2': {
                    foo: '#',
                },
                '3': '#',
                'and finally': 'all done',
            });
            done();
        })
        .catch(done.fail);
    });

    it('parallel run with nested series run', function (done) {
        var start = Date.now();
        PromiseRun.parallel({
            foo: Promise.resolve('ok'),
            bar: [
                function (resolve) {
                    setTimeout(function () {
                        resolve('ok');
                    }, 200);
                },
                function (resolve) {
                    setTimeout(function () {
                        resolve('ok');
                    }, 200);
                }
            ],
        })
        .then(function (values) {
            var finish = Date.now();
            var diff = finish - start;
            // console.log(diff);
            expect(diff).toBeGreaterThan(400);
            expect(diff).toBeLessThan(450);
            expect(values).toEqual({
                foo: 'ok',
                bar: {
                    '0': 'ok',
                    '1': 'ok',
                },
            });
            done();
        })
        .catch(done.fail);
    }, 500);
});
