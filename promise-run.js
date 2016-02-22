"use strict";

;(function (globalScope) {

function PromiseRunException(message) {
    this.name = 'PromiseRunException';
    this.message = message;
    this.stack = (new Error()).stack.replace(/^.+\n/, '');
}

function PromiseRun() {
    this.store = {};
}

PromiseRun.prototype = {
    add: function add(name, resolver, state) {
        if (typeof name !== 'string') {
            throw new PromiseRunException('First argument `name` must be a string.');
        }
        if (this.store[name]) {
            throw new PromiseRunException('Promise name already registered.');
        }
        var promise;
        if (isPromising(resolver)) {
            promise = resolver;
        }
        else if (isFunction(resolver)) {
            promise = promiseAdapter.create(resolver.bind(state || {}));
        }
        else if (isPlainObject(resolver)) {
            promise = PromiseRun.parallel(resolver, state);
        }
        else if (isArray(resolver)) {
            promise = PromiseRun.series(resolver, state);
        }
        else {
            throw new PromiseRunException('`resolver` cannot be used.');
        }
        this.store[name] = promise;
        return this;
    },
    remove: function remove(name) {
        delete this.store[name];
        return this;
    },
    clear: function clear() {
        this.store = {};
        return this;
    },
    flush: function flush() {
        var promises = [];
        var names = {};
        var index = 0;
        for (var name in this.store) {
            promises.push(this.store[name]);
            names[index] = name;
            index++;
        }
        this.clear();
        return promiseAdapter.all(promises).then(function (values) {
            var namedValues = {};
            values.forEach(function (result, index) {
                namedValues[names[index]] = result;
            });
            return promiseAdapter.resolve(namedValues);
        });
    },
};

PromiseRun.parallel = function (object, state) {
    var runner = new PromiseRun();
    for (var name in object) {
        runner.add(name, object[name], state);
    }
    return runner.flush();
};

PromiseRun.series = function (array, state) {
    var values = state || {};
    return new Promise(function (resolve, reject) {
        function tick(index) {
            var next = array.shift();
            if (typeof next === 'undefined') {
                return resolve(values);
            }

            var name, resolver;
            if (isArray(next)) {
                name = next[0];
                resolver = next[1];
            }
            else {
                name = index;
                resolver = next;
            }

            var promise;
            if (isPromising(resolver)) {
                promise = resolver;
            }
            else if (isFunction(resolver)) {
                promise = promiseAdapter.create(resolver.bind(values));
            }
            else if (isPlainObject(resolver)) {
                promise = PromiseRun.parallel(resolver, values);
            }
            else {
                console.log(resolver);
                throw new PromiseRunException('`resolver` cannot be used.');
            }

            // console.time(name);
            promise.then(function (result) {
                    // console.timeEnd(name);
                    values[name] = result;
                    tick(index + 1);
                })
                .catch(function (reason) {
                    reject(reason);
                });
        }
        tick(0);
    });
};

PromiseRun.exec = function (object) {
    return PromiseRun[isArray(object) ? 'series' : 'parallel'](object);
};


function isPromising(object) {
    return typeof object === 'object' && object.then && typeof object.then === 'function';
}
function isPlainObject(object) {
    return Object.prototype.toString.call(object) === '[object Object]';
}
function isFunction(object) {
    return typeof object === 'function';
}
function isArray(object) {
    return Array.isArray(object);
}


var promiseAdapters = {};
var promiseAdapter;

PromiseRun.addAdapter = function (name, object) {
    var candidate = {};
    ['create', 'resolve', 'all'].forEach(function (method) {
        if (object && typeof object[method] === 'function') {
            candidate[method] = object[method];
        }
        else {
            throw new PromiseRunException('Adapter missing method ' + method);
        }
    });
    promiseAdapters[name] = candidate;
};

PromiseRun.useAdapter = function (name) {
    if (!(name in promiseAdapters)) {
        throw new PromiseRunException('Adapter "' + name + '" not recognised.');
    }
    promiseAdapter = promiseAdapters[name];
};

PromiseRun.addAdapter('native', {
    create: function (callback) {
        return new Promise(callback);
    },
    resolve: function (value) {
        return Promise.resolve(value);
    },
    all: function (array) {
        return Promise.all(array);
    },
});

PromiseRun.useAdapter('native');


if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    module.exports = PromiseRun;
}
else {
    globalScope.PromiseRun = PromiseRun;
}

}(this));
