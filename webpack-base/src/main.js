//想要webpack打包该资源 必须要引入
import count from "./js/count"
import sum from "./js/sum"
import "./css/index.css"
import "./less/index.less"
import "./sass/index.scss"
import "./sass/index.sass"
//import "core-js";//这样引入会将所有兼容性代码全部引入，体积太大了。我们只想引入 promise 的 polyfill。
import "core-js/es/promise";

console.log(count(9,3));
console.log(sum(2,6));
if (module.hot) {
    module.hot.accept("./js/sum.js", function (sum) {
      const result2 = sum(1, 2, 3, 4);
      console.log(result2);
    });
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
  document.getElementById("btn").onClick = function () {
    // eslint会对动态导入语法报错，需要修改eslint配置文件
    // webpackChunkName: "math"：这是webpack动态导入模块命名的方式
    // "math"将来就会作为[name]的值显示。
    import(/* webpackChunkName: "math" */ "./js/math.js").then(({ count }) => {
      console.log(count(2, 1));
    });
  };

  // 添加promise代码
  const promise = Promise.resolve();
  promise.then(() => {
  console.log("hello promise");
  });