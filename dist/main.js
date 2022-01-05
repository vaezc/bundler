
    (function(graph){
        function require(module){
            function localRequire(relativePath){
                return require(graph[module].dependencies[relativePath])
            }
    
            var exports = {};
            (function(require,exports,  code){
                eval(code)
            })(localRequire, exports, graph[module].code)
            return exports;
        }
        require('./src/index.js')
    })({"./src/index.js":{"dependencies":{"./a.js":"./src/a.js"},"code":"\"use strict\";\n\nvar _a = require(\"./a.js\");\n\nconsole.log(\"\".concat(_a.str, \" Webpack\"));"},"./src/a.js":{"dependencies":{"./b.js":"./src/b.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.str = void 0;\n\nvar _b = require(\"./b.js\");\n\nvar str = \"hello\";\nexports.str = str;\nconsole.log(_b.b);"},"./src/b.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.b = void 0;\nvar b = \"bbbb\";\nexports.b = b;"}})