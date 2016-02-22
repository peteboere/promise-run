if (typeof process !== 'undefined' && process.title === 'node') {
    PromiseRun = require('../promise-run.js');
}

describe('Parallel', function () {

    it('should run parallel tasks at the same time', function (done) {
        var start = Date.now();
        PromiseRun.parallel({
            foo: function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            },
            bar: function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            },
            baz: function (resolve) {
                setTimeout(function () {
                    resolve('ok');
                }, 200);
            },
        })
        .then(function (values) {
            var finish = Date.now();
            var diff = finish - start;
            // console.log(diff);
            expect(diff).toBeGreaterThan(199);
            expect(diff).toBeLessThan(210);
            expect(values).toEqual({
                foo: 'ok',
                bar: 'ok',
                baz: 'ok',
            });
            done();
        })
        .catch(done.fail);

    }, 300);

    it('should accept functions or promises', function (done) {
        PromiseRun.parallel({
            foo: function (resolve) {
                resolve('ok');
            },
            bar: new Promise(function (resolve) {
                resolve('ok');
            }),
        })
        .then(function (values) {
            expect(values).toEqual({
                foo: 'ok',
                bar: 'ok',
            });
            done();
        })
        .catch(done.fail);
    });

    it('should be nestable', function (done) {
        PromiseRun.parallel({
            foo: function (resolve) {
                resolve('ok');
            },
            bar: {
                baz: function (resolve) {
                    resolve('ok');
                },
                buz: new Promise(function (resolve) {
                    resolve('ok');
                }),
            },
        })
        .then(function (values) {
            expect(values).toEqual({
                foo: 'ok',
                bar: {
                    baz: 'ok',
                    buz: 'ok',
                },
            });
            done();
        })
        .catch(done.fail);
    });

    it('should handle rejections', function (done) {
        PromiseRun.parallel({
            foo: function (resolve) {
                resolve('ok');
            },
            bar: PromiseRun.parallel({
                baz: function (resolve) {
                    resolve('ok');
                },
                buz: new Promise(function (resolve, reject) {
                    reject('not ok');
                }),
            }),
        })
        .then(done.fail)
        .catch(function (reason) {
            expect(reason).toEqual('not ok');
            done();
        });
    });

    it('should handle rejections pt2', function (done) {
        PromiseRun.parallel({
            foo: function (resolve, reject) {
                reject('not ok');
            },
            bar: PromiseRun.parallel({
                baz: function (resolve) {
                    resolve('ok');
                },
                buz: new Promise(function (resolve) {
                    resolve('ok');
                }),
            }),
        })
        .then(done.fail)
        .catch(function (reason) {
            expect(reason).toEqual('not ok');
            done();
        });
    });
});
