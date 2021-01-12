const path = require('path');

const main = () => {
    return {
        entry: {
            main: './src/main/Main'
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        target: 'electron-main',
        node: {
            __dirname: false
        }
    };
};

const injection = () => {
    return {
        entry: {
            injection: './src/injection/Injection'
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        }
    };
};

const renderer = () => {
    return {
        entry: {
            renderer: './src/renderer/Renderer'
        },
        output: {
            path: path.join(__dirname, './dist/renderer'),
            publicPath: '/renderer',
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js', '.tsx', '.jsx'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                injectType: 'singletonStyleTag',
                                esModule: false
                            }
                        },
                        '@teamsupercell/typings-for-css-modules-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                modules: {
                                    exportLocalsConvention: 'camelCaseOnly',
                                    localIdentName: '[name]_[local]_[hash:base64:5]'
                                }
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: {
                                        'postcss-import': {},
                                        'postcss-preset-env': {}
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        externals: ['bufferutil', 'utf-8-validate'],
        target: 'electron-renderer',
        node: {
            __dirname: false
        }
    };
};

module.exports = [main, injection, renderer];
