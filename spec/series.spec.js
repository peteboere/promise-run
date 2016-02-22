if (typeof process !== 'undefined' && process.title === 'node') {
    PromiseRun = require('../promise-run.js');
}

describe('Series', function () {

    it('should run series tasks ok', function(done) {
        var start = Date.now();
        PromiseRun.series([
            ['foo', function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            }],
            ['bar', function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            }],
            ['baz', function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            }],
        ])
        .then(function(values) {
            var finish = Date.now();
            var diff = finish - start;
            // console.log('series', diff);
            expect(diff).toBeGreaterThan(599);
            expect(diff).toBeLessThan(650);
            expect(values).toEqual({
                foo: 'ok',
                bar: 'ok',
                baz: 'ok',
            });
            done();
        })
        .catch(done.fail);
    }, 700);


    it('should allow nesting parallel sections', function (done) {
        PromiseRun.series([
            ['foo', function (resolve) {
                resolve('ok');
            }],
            ['bar', {
                'run': Promise.resolve('ok'),
                'in': Promise.resolve('ok'),
                'parallel': Promise.resolve('ok'),
            }],
        ])
        .then(function(values) {
            expect(values).toEqual({
                foo: 'ok',
                bar: {
                    run: 'ok',
                    'in': 'ok',
                    parallel: 'ok',
                },
            });
            done();
        })
        .catch(done.fail);
    });

});
