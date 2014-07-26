 /*
    Copyright (C) 2012 Anthony Foster, https://github.com/equationIO/api (v0.1)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

'use strict';

(function (module) {
    var exports = module.exports;
    exports.Graph = Graph;


    var guid = (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
      };
    })();

    var SRC = 'http://equation.io/api.v1.html';
    var SRC_HOST = 'http://localhost:3090';

    SRC = SRC_HOST + '/mock.html';

    var listening = false;
    var _handlers = {};

    function receiveMessage(event) {

        if (event.origin !== SRC_HOST) return;
        var evt;
        try {
          evt = JSON.parse(event.data);
        } catch (ex) {}

        if (!evt) return;

        if (!evt.equationIO) return;

        if (_handlers[evt.id]) {
            var h = _handlers[evt.id];
            delete _handlers[evt.id];
            h[1].apply(h[0], evt.args);
        }
    }

    function listen() {
        window.addEventListener('message', receiveMessage, false);
        listening = true;
    }

    function Graph (opts) {
        opts = opts || {};
        this.equations = [];
        this.context = {};
        this._queue = [];
        this._ready = false;

        var iframe = document.createElement('iframe');
        iframe.width = opts.width || 800;
        iframe.height = opts.height || 600;
        iframe.style.border = 'none';

        this._element = iframe;

        var self = this;
        this._element.onload = function () {
            self._ready = true;
            var queued = self._queue;
            self._queue = [];
            queued.forEach(function (ar) {
                ar[0].apply(self, ar[1]);
            });
        };
        this._element.src = SRC;
        if (!listening) listen();
    }

    Graph.prototype.init = function (parentNode, done) {
        parentNode.appendChild(this._element);
        this.api('init', {}, done);
    };

    Graph.prototype.api = function (name, data, done) {
        if (!this._ready) return this._queue.push([this.api, arguments]);
        var encoded;
        if (done) {
            var messageId = guid();
            _handlers[messageId] = [this, done];
            encoded = JSON.stringify({id: messageId, name: name, data: data});
        } else {
            encoded = JSON.stringify({name: name, data: data});
        }
        this._element.contentWindow.postMessage(encoded, SRC_HOST);
    };

    Graph.prototype.update = function (done) {
        this.equations.forEach(function (eq) {
            eq._id = eq._id || guid();
        });
        
        this.api('api.v1.update', {equations: this.equations}, done);
    };

})(function () {

    var exports = {};

    if (typeof define === 'function' && define.amd) {
        define('equation-io-api', [], function () { return exports; });
    } else if (typeof module !== 'undefined') {
        return module;
    } else {
        window.EquationIO = exports;
    }

    return {exports: exports};

}());