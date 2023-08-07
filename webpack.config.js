const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack')
const os = require('os')
const cpuCores = os.cpus().length
const config = {
    mode: 'development',
    entry: {
        'login': [path.resolve(__dirname, 'src/login/index.js')],//入口文件,
        'content': path.resolve(__dirname, 'src/content/index.js'),//入口文件,
        'publish': path.resolve(__dirname, 'src/publish/index.js'),//入口文件,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),//输出文件夹
        filename: './[name]/index.js',//出口文件
        clean: true
    },
    devServer: {
        static: './dist',//配置从目录提供静态文件的选项（默认是 'public' 文件夹）
        open: {
            target: ['login/index.html'],//设置打开的页面
            app: {//设置打开的浏览器的配置
                name: 'chrome',
            }
        },
        hot: true,
        port: 8888,
    },
    plugins: [//插件设置
        new MiniCssExtractPlugin({//提取css文件
            filename: './[name]/index.css'
        }),

        new HtmlWebpackPlugin({//网页包插件设置
            template: path.join(__dirname, 'src/login/login.html'),//源文件
            filename: path.join(__dirname, 'dist/login/index.html'), //目标文件
            useCdn: process.env.NODE_ENV === 'production',//生产模式下使用cdn
            chunks: ['login', 'commons', 'style']
        }),
        new HtmlWebpackPlugin({//网页包插件设置
            template: path.join(__dirname, 'src/content/content.html'),//源文件
            filename: path.join(__dirname, 'dist/content/index.html'), //目标文件
            useCdn: process.env.NODE_ENV === 'production',//生产模式下使用cdn
            chunks: ['content', 'commons', 'style']
        }),
        new HtmlWebpackPlugin({//网页包插件设置
            template: path.join(__dirname, 'src/publish/publish.html'),//源文件
            filename: path.join(__dirname, 'dist/publish/index.html'), //目标文件
            useCdn: process.env.NODE_ENV === 'production',//生产模式下使用cdn
            chunks: ['publish', 'commons', 'style']
        }),

        //编译时 将你代码中的变量替换为其他值或表达式
        new webpack.DefinePlugin({//将左侧字符串替换成右侧的变量结果
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),

    ],

    module: {  // 加载器（让 webpack 识别更多模块文件内容）
        rules: [
            {
                oneOf: [
                    // {
                    //     test: /\.(htm|html)$/,
                    //     use: ['raw-loader']
                    // },//html文件的解析
                    {
                        test: /\.css$/i,//能识别css
                        use: [
                            process.env.NODE_ENV === 'development' ? "style-loader" : MiniCssExtractPlugin.loader,
                            "css-loader",
                            {//postcss-loader进行兼容css兼容性处理
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: [
                                            [
                                                'postcss-preset-env',
                                                {
                                                    // 其他选项
                                                },
                                            ],
                                        ],
                                    },
                                }
                            },

                        ],//style-loader不能于MiniCssExtractPlugin.loader同时使用；
                        // 因为style-loader是将CSS注入DOM并且工作速度更快，而MiniCssExtractPlugin.loader是把css部分单独提取成一个css文件
                    },//css文件解析
                    {
                        test: /\.less$/i,
                        use: [
                            // compiles Less to CSS
                            // 'style-loader',
                            process.env.NODE_ENV === 'development' ? "style-loader" : MiniCssExtractPlugin.loader,
                            'css-loader',
                            'less-loader',
                            {//postcss-loader进行兼容css兼容性处理
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: [
                                            [
                                                'postcss-preset-env',
                                                {
                                                    // 其他选项
                                                },
                                            ],
                                        ],
                                    },
                                }
                            },
                        ],
                    },//less文件解析
                    {
                        test: /\.s[ac]ss$/i,//识别sa\css，能正确打包sa\css文件
                        use: [
                            // 将 JS 字符串生成为 style 节点(MiniCssExtractPlugin.loader,)
                            process.env.NODE_ENV === 'development' ? "style-loader" : MiniCssExtractPlugin.loader,
                            // 'style-loader',
                            // 将 CSS 转化成 CommonJS 模块
                            'css-loader',
                            // 将 Sass 编译成 CSS
                            'sass-loader',
                            {//postcss-loader进行兼容css兼容性处理
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: [
                                            [
                                                'postcss-preset-env',
                                                {
                                                    // 其他选项
                                                },
                                            ],
                                        ],
                                    },
                                }
                            },

                        ],
                    },//scss文件解析
                    {
                        test: /\.m?js$/,//babel设置
                        exclude: /(node_modules|bower_components)/,//排除的，不进行编译的文件夹
                        use: [
                            {
                                loader: "thread-loader",
                                options: {
                                    workers: cpuCores-1//进程数量
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    // presets: ['@babel/preset-env']
                                    plugins: ["@babel/plugin-transform-runtime"],
                                    cacheDirectory: true,//开启babel缓存
                                    cacheCompression: false//关闭缓存压缩
                                }
                            }

                        ]
                    },//js文件解析
                    {
                        test: /\.(png|jpg|jpeg|gif)$/i,//图片文件的打包配置
                        type: 'asset',
                        generator: {
                            filename: 'asset/img/[name][hash:10][ext][query]'
                        },
                        parser: {
                            dataUrlCondition: {
                                maxSize: 8 * 1024 // 8kb
                            }
                        }

                    }//图片资源解析
                ]
            }
        ]
    },
    optimization: {//优化
        minimizer: [//最小化
            // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
            `...`,
            // process.env.NODE_ENV === 'production' ? new CssMinimizerPlugin():''//多此一举
            new CssMinimizerPlugin(),
            new TerserPlugin({
                parallel: cpuCores-1//用于压缩的开启的进程数量
            })


        ],
        splitChunks: {
            chunks: 'all', // 所有模块动态非动态移入的都分割分析
            cacheGroups: { // 分隔组
                commons: { // 抽取公共模块
                    minSize: 0, // 抽取的chunk最小大小字节
                    minChunks: 2, // 最小引用数
                    reuseExistingChunk: true, // 当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用
                    name(module, chunks, cacheGroupKey) { // 分离出模块文件名
                        // const moduleFileName = module
                        //     .identifier()
                        //     .split('/')
                        //     .reduceRight((item) => item);
                        // const allChunksNames = chunks.map((item) => item.name).join('~');
                        // return `${cacheGroupKey}-${allChunksNames}`;
                        const allChunksNames = chunks.map((item) => item.name).join('~') // chuck名1~chuck名字2
                        return `./js/${allChunksNames}` // 输出到 dist 目录下位置
                    }
                },
                style: {
                    priority: 1,//优先级（自定义规则默认是0）
                    minSize: 0, // 抽取的chunk最小大小字节
                    minChunks: 2, // 最小引用数
                    reuseExistingChunk: true, // 当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用
                    test: /\.(css|less|sass|scss)$/, // 匹配不同类型的样式文件
                    name(module, chunks, cacheGroupKey) { // 分离出模块文件名
                        const allChunksNames = chunks.map((item) => item.name).join('~') // chuck名1~chuck名字2
                        return `./style/${allChunksNames}` // 输出到 dist 目录下位置
                    }
                }
            }
        }
    },
    resolve: {//解析
        alias: {// 别名
            '@': path.resolve(__dirname, 'src')
        }
    },
};
// 开发环境下使用 sourcemap 选项
if (process.env.NODE_ENV === 'development') {
    config.devtool = 'inline-source-map'
    //可以看到，此错误包含有发生错误的文件（print.js）和行号（2）的引用，
    // 我们可以确切地知道，所要解决问题的位置。（此配置仅用于示例，不要用于生产环境）：
}
if (process.env.NODE_ENV === 'production') {
    // 外部扩展（让 webpack 防止 import 的包被打包进来）
    config.externals = {
        // key：import from 语句后面的字符串
        // value：留在原地的全局变量（最好和 cdn 在全局暴露的变量一致）
        //key value两个格式为字符串
        'bootstrap/dist/css/bootstrap.min.css': 'bootstrap',
        'axios': "axios",
        'form-serialize': "serialize",
        '@wangeditor/editor': 'wangEditor'

    }
}
module.exports = config