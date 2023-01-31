const path=require("path") //nodejs核心模块 专门用来处理路径问题
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports={
    //入口
    entry:"./src/main.js", //相对路径
    //输出
    output:{
        //文件的输出路径
        //_dirname nodejs的变量，代表当前文件的文件夹目录
        //开发模式下没有输出
        // path:path.resolve(__dirname,"../dist"),//绝对路径
        path:undefined,
        //文件名
        filename:"static/js/main.js",
        //打包输出的其他文件
        chunkFilename:"static/js/[name].js",
        //自动清空上次打包结果
        //原理：在打包前将dist目录删除
        clean:true
    },
    //加载器
    module:{
        rules:[
            //loader的配置
            {
                //每个文件只能被其中一个loader
                oneOf:[
                    {
                        test:/\.css$/,//只检测xxx文件
                        //执行顺序 从右到左(从下到上)
                        use:[
                            "style-loader", //将js中的css通过创建style标签添加到html文件中生效
                            "css-loader" //把css资源编译成commonjs的模块到js中
                        ]
                    },
                    {
                        test:/\.less$/,
                        //loader:xxx 只能使用一个loader
                        use:[
                            "style-loader",
                            "css-loader",
                            "less-loader"//将less编译成css文件
                        ]
                    },
                    {
                        test:/\.s[ac]ss$/,
                        //loader:xxx 只能使用一个loader
                        use:[
                            "style-loader",
                            "css-loader",
                            "sass-loader"//将sass编译成css文件
                        ]
                    },
                    {
                        test:/\.styl$/,
                        //loader:xxx 只能使用一个loader
                        use:[
                            "style-loader",
                            "css-loader",
                            "stylus-loader"//将stylus编译成css文件
                        ]
                    },
                    {
                        test:/\.(png|jpe?g|gif|weebp|svg)$/,
                        type:"asset",
                        parser:{
                            dataUrlCondition:{
                                //小于10kb的图片转base64
                                //优点：减少请求数量  缺点：体积会大
                                maxSize:10*1024 //10kb
                            }
                        },
                        generator:{
                            //输出图片的名称
                            filename:'static/images/[hash:10][ext][query]'
                        }
                    },
                    {
                        test:/\.(ttf|woff2?|map3|map4avi)$/,
                        type:"asset/resource",
                        generator:{
                            //输出图片的名称
                            //hash值取前十位
                            filename:'static/media/[hash:10][ext][query]'
                        }
                    },
                    {
                        test:/\.js$/,
                        exclude:/node_modules/,//排除modules中的js文件 这些不处理
                        loader:'babel-loader',
                        //建议把这一块写到外面 即babel.config.js中
                        options:{
                        //     presets:["@babel/preset-env"],//智能预设能够编译ES6的语法
                               cacheDirectory:true,//开启babel缓存
                               cacheCompression:false,//关闭缓存文件压缩
                        }
                
                    }
                ]
            }
        ]
    },
    //插件
    plugins:[
        //插件的配置
        new ESLintWebpackPlugin({
            //监测哪些文件
            context:path.resolve(__dirname,"../src"),
            exclude:"node_modules"
        }),
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"),
          }),

    ],
     // 代码分割配置
     splitChunks: {
        chunks: "all", // 对所有模块都进行分割
        // 其他内容用默认配置即可
      },
    // 开发服务器  启动指令npx webpack serve
    //不会输出资源，在内存中编译打包的
    devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    hot:true//开启HMR(默认值) 开发模式下可以提升打包速度 部分刷新  生产模式下不可以
    },
    //模式
    mode:"development",
    // 优点：打包编译速度快，只包含行映射
    // 缺点：没有列映射
    devtool: "cheap-module-source-map",
}