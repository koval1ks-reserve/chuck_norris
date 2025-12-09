const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: './js/main.js',
    },
    devtool: 'source-map',
    mode: "development",
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].js',
        environment: {
            arrowFunction: false,
            const: false,
            destructuring: false,
        },
    },
    target: ['web', 'es10'],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules[\\/](?!(template-element|@babel[\\/]runtime-corejs3))/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, 
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './node_modules/@webcomponents/webcomponentsjs',
                    to: path.resolve(__dirname, 'lib/webcomponentsjs')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, '.'), 
        },
        port: 3000,
        open: true,
    },
}