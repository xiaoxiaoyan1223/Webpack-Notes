module.exports={
    //智能预设能够编译ES6的语法
    presets:[
    [
        "@babel/preset-env",
        // 按需加载core-js的polyfill
        { useBuiltIns: "usage", corejs: { version: "3", proposals: true } },
    ],
 ],
}