const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

const moduleAnalyser = (filename) => {
  //读取文件内容
  const content = fs.readFileSync(filename, "utf8");

  //将文件内容转化为抽象语法树 ast

  const ast = parser.parse(content, {
    sourceType: "module",
  });

  const dependencies = {};

  traverse(ast, {
    //遍历 ast ， 找出type 是Importdeclaration的元素，会执行下面的函数
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
      console.log("dependencies", dependencies);
    },
  });

  // 将ast 编译成浏览器可以运行的代码
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  console.log("code", code);

  // 将模块分析结果返回
  return {
    filename,
    dependencies,
    code,
  };
};

const getDependenciesGraph = (entry) => {
  const entryModule = moduleAnalyser(entry);
  const graphArray = [entryModule];

  for (let index = 0; index < graphArray.length; index++) {
    const { dependencies } = graphArray[index];
    for (const key in dependencies) {
      const newModule = moduleAnalyser(dependencies[key]);
      graphArray.push(newModule);
    }
  }

  console.log("graphArray", graphArray);

  const dependenciesGraph = {};
  graphArray.forEach((item) => {
    dependenciesGraph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code,
    };
  });

  return dependenciesGraph;
};

const generateCode = (entry) => {
  const graph = JSON.stringify(getDependenciesGraph(entry));

  return `
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
        require('${entry}')
    })(${graph})`;
};

const code = generateCode("./src/index.js");
// console.log("code", code);
const config = require("./webpack.config.js");
const filePath = path.join(config.output.path, config.output.filename);

fs.writeFileSync(filePath, code, "utf-8");
