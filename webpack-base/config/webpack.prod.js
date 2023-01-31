const path=require("path") //nodejs核心模块 专门用来处理路径问题
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const os=require("os")
//多进程处理eslint和babel任务 速度更快
const threads=os.cpus().length //cpu的核数
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
//实现离线体验
const WorkboxPlugin = require("workbox-webpack-plugin");
// 获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
    return [
      MiniCssExtractPlugin.loader,
      "css-loader",
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [
              "postcss-preset-env", // 能解决大多数样式兼容性问题
            ],
          },
        },
      },
      preProcessor,
    ].filter(Boolean);
  }

module.exports={
    //入口
    entry:"./src/main.js", //相对路径
    //输出
    output:{
        //文件的输出路径
        //_dirname nodejs的变量，代表当前文件的文件夹目录
        path:path.resolve(__dirname,"../dist"),//绝对路径
        //文件名
        // filename:"main.js",
        filename: "static/js/[name].js", // 入口文件打包输出资源命名方式
        chunkFilename: "static/js/[name].chunk.js", // 动态导入输出资源命名方式
        assetModuleFilename: "static/media/[name].[hash][ext]", // 图片、字体等资源命名方式（注意用hash）
        //自动清空上次打包结果
        //原理：在打包前将dist目录删除
        // clean:true
    },
    //加载器
    module:{
        rules:[
            //loader的配置
           {
            oneOf:[
                {
                    test:/\.css$/,//只检测xxx文件
                    //执行顺序 从右到左(从下到上)
                    use:getStyleLoaders()
                },
                {
                    test:/\.less$/,
                    //loader:xxx 只能使用一个loader
                    use:getStyleLoaders("less-loader")
                },
                {
                    test:/\.s[ac]ss$/,
                    //loader:xxx 只能使用一个loader
                    use:getStyleLoaders("sass-loader")
                },
                {
                    test:/\.styl$/,
                    //loader:xxx 只能使用一个loader
                    use:getStyleLoaders("stylus-loader")
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
                    //建议把这一块写到外面 即babel.config.js中
                    // options:{
                    //     presets:["@babel/preset-env"],//智能预设能够编译ES6的语法
                        //    cacheDirectory:true,//开启babel缓存
                        //    cacheCompression:false,//关闭缓存文件压缩
                    // }
                    use: [
                        {
                          loader: "thread-loader", // 开启多进程
                          options: {
                            workers: threads, // 数量
                          },
                        },
                        {
                          loader: "babel-loader",
                          options: {
                            cacheDirectory: true, // 开启babel编译缓存
                          },
                        },
                      ],
            
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
            exclude:"node_modules",
            cache:true,//开启缓存
            cacheLocation:path.resolve(__dirname,'../node_modules/.cache/eslintcache')
        }),
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"),
          }),
          threads,//开启多进程和设置进程数量
        // 提取css成单独文件
        new MiniCssExtractPlugin({
        // 定义输出文件名和目录
        filename: "static/css/[name].[contenthash:10].css",
        chunkFilename:"static/css/[name].chunk.[contenthash:10].css"
      }),
       // css压缩
        // new CssMinimizerPlugin(), 
        new PreloadWebpackPlugin({
        rel: "preload", // preload兼容性更好
        as: "script",
        // rel: 'prefetch' // prefetch兼容性更差
      }),
      new WorkboxPlugin.GenerateSW({
        // 这些选项帮助快速启用 ServiceWorkers
        // 不允许遗留任何“旧的” ServiceWorkers
        clientsClaim: true,
        skipWaiting: true,
      }),

    ],
    optimization: {
        minimizer: [
          // css压缩也可以写到optimization.minimizer里面，效果一样的
          new CssMinimizerPlugin(),
          // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
          new TerserPlugin({
            parallel: threads, // 开启多进程
          }),
          // 压缩图片
          new ImageMinimizerPlugin({
            minimizer: {
              implementation: ImageMinimizerPlugin.imageminGenerate,
              options: {
                plugins: [
                  ["gifsicle", { interlaced: true }],
                  ["jpegtran", { progressive: true }],
                  ["optipng", { optimizationLevel: 5 }],
                  [
                    "svgo",
                    {
                      plugins: [
                        "preset-default",
                        "prefixIds",
                        {
                          name: "sortAttrs",
                          params: {
                            xmlnsOrder: "alphabetical",
                          },
                        },
                      ],
                    },
                  ],
                ],
              },
            },
          }),
        ],
        splitChunks:{
          chunks:"all",
          //其他都有默认值
        },
        runtimeChunk:{
            name:(entrypoint)=>`runtime~${entrypoint.name}.js `
        }
      },
    // 开发服务器  启动指令npx webpack serve
    //不会输出资源，在内存中编译打包的
    devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器

    },
    //模式
    mode:"development",
    // 优点：包含行/列映射
    // 缺点：打包编译速度更慢
    devtool: "source-map",
}