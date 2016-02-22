if (typeof process !== 'undefined' && process.title === 'node') {
    PromiseRun = require('../promise-run.js');
}

describe('Adapters', function () {

    it('should accept a well formed adapter', function () {
        var addAdapter = function () {
            PromiseRun.addAdapter('test', {
                resolve: function () {},
                all: function () {},
                create: function () {},
            });
        };
        expect(addAdapter).not.toThrow();
    });

    it('should throw a malformed adapter', function () {
        var addAdapter = function () {
            PromiseRun.addAdapter('test', {
                resolve: function () {},
                allOrNothing: function () {},
                create: function () {},
            });
        };
        expect(addAdapter).toThrow();
    });

    it('should throw an unrecognized adapter', function () {
        var useAdapter = function () {
            PromiseRun.useAdapter('nothing');
        };
        expect(useAdapter).toThrow();
    });

    it('should accept a recognized adapter', function () {
        var useAdapter = function () {
            PromiseRun.useAdapter('test');
        };
        expect(useAdapter).not.toThrow();
        PromiseRun.useAdapter('native');
    });
});
