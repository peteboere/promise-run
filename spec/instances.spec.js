if (typeof process !== 'undefined' && process.title === 'node') {
    PromiseRun = require('../promise-run.js');
}

describe('Instances', function () {

    it('should construct a promise runner', function () {
        var runner = new PromiseRun();
        expect(runner).toBeTruthy();
        expect(runner.store).toEqual({});
    });

    it('runner.add() should throw bad arguments', function () {
        var runner = new PromiseRun();
        var test;

        test = function () {
            runner.add('test', null);
        };
        expect(test).toThrow();

        test = function () {
            runner.add('test');
        };
        expect(test).toThrow();

        test = function () {
            runner.add(function () {});
        };
        expect(test).toThrow();
    });

    it('runner.add() should play with good arguments', function () {
        var runner = new PromiseRun();
        var test;

        test = function () {
            runner.add('test', function () {});
        };
        expect(test).not.toThrow();
        expect(runner.store.test).toBeTruthy();
    });

    it('runner.add() should throw if adding the same name twice', function () {
        var runner = new PromiseRun();
        var test;

        test = function () {
            runner.add('test', function (resolve, reject) {});
            runner.add('test', function (resolve, reject) {});
        };
        expect(test).toThrow();
    });

    it('runner.add() should allow chaining', function () {
        var runner = new PromiseRun();
        try {
            runner.add('test', function (resolve, reject) {})
                .add('test2', function (resolve, reject) {});
            expect('test' in runner.store).toEqual(true);
            expect('test2' in runner.store).toEqual(true);
        }
        catch (ex) {
            expect('unexpected').toEqual('error');
        }
    });
});


describe('Running instances', function () {

    it('runner.flush() should execute the promises', function (done) {
        var runner = new PromiseRun();

        runner.add('test', function (resolve, reject) {
                resolve('loaded');
            })
            .add('test2', function (resolve, reject) {
                resolve('loaded');
            })
            .add('test3', function (resolve, reject) {
                resolve('done');
            });

        runner.flush()
            .then(function (values) {
                expect(values).toEqual({
                    test: 'loaded',
                    test2: 'loaded',
                    test3: 'done',
                });
                done();
            });
    })
});
