const { configureWebpack, graphQL } = require('@magento/pwa-buildpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ModuleOverridePlugin = require('./src/plugin/moduleOverridePlugin');
const cedOverrideMapping = require('./src/plugin/mapping');
const webpack = require('webpack');

const {
    getMediaURL,
    getStoreConfigData,
    getAvailableStoresConfigData,
    getPossibleTypes
} = graphQL;

const { DefinePlugin } = webpack;
//const { LimitChunkCountPlugin } = webpack.optimize;

module.exports = async env => {
    /**
     * configureWebpack() returns a regular Webpack configuration object.
     * You can customize the build by mutating the object here, as in
     * this example. Since it's a regular Webpack configuration, the object
     * supports the `module.noParse` option in Webpack, documented here:
     * https://webpack.js.org/configuration/module/#modulenoparse
     */
    const config = await configureWebpack({
        context: __dirname,
        // vendor: [
        //     '@apollo/client',
        //     'apollo-cache-persist',
        //     'informed',
        //     'react',
        //     'react-dom',
        //     'react-feather',
        //     'react-redux',
        //     'react-router-dom',
        //     'redux',
        //     'redux-actions',
        //     'redux-thunk'
        // ],
        special: {
            'react-feather': {
                esModules: true
            },
            'photoswipe': {
                esModules: true
            }
        },
        env
    });

    const mediaUrl = await getMediaURL();
    const storeConfigData = await getStoreConfigData();
    const { availableStores } = await getAvailableStoresConfigData();

    /**
     * Loop the available stores when there is provided STORE_VIEW_CODE
     * in the .env file, because should set the store name from the
     * given store code instead of the default one.
     */
    const availableStore = availableStores.find(
        ({ code }) => code === process.env.STORE_VIEW_CODE
    );

    global.MAGENTO_MEDIA_BACKEND_URL = mediaUrl;
    global.LOCALE = storeConfigData.locale.replace('_', '-');
    global.AVAILABLE_STORE_VIEWS = availableStores;

    const possibleTypes = await getPossibleTypes();


    config.module.noParse = [
        /@adobe\/adobe\-client\-data\-layer/,
        /braintree\-web\-drop\-in/
    ];
    config.optimization = {
        minimize: true,
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                reactVendor: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: 'reactvendor'
                },
                utilityVendor: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/](react-router-dom|jquery)[\\/]/,
                    name: 'utilityVendor'
                },
                reduxVendor: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/](react-redux|redux|redux-actions|redux-thunk)[\\/]/,
                    name: 'reduxVendor'
                },
                babelVendor: {
                    chunks: 'initial',
                    test: /(babel|style-loader|workbox)/,
                    name: 'babelVendor'
                },
                mageVendor: {
                    chunks: 'initial',
                    test: /(react-intl|helmet|fontawesome)/,
                    name: 'mageVendor'
                },
                gqVendor: {
                    chunks: 'initial',
                    test: /(graphql)/,
                    name: 'gqVendor'
                },
                apolloVendor: {
                    test: /(apollo)/,
                    name: 'apolloVendor'
                },
                bootstrapVendor: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/](bootstrap)[\\/]/,
                    name: 'bootstrapVendor'
                },
                vendor: {
                    test: /[\\/]node_modules[\\/](!bootstrap)(!react)(!react-dom)(!jquery)(!react-redux)(!react-router-dom)(!redux)(!redux-actions)(!redux-thunk)[\\/]/,
                    name: 'vendor'
                }
            }
        }
    };
    config.plugins = [
        ...config.plugins,
        new DefinePlugin({
            /**
             * Make sure to add the same constants to
             * the globals object in jest.config.js.
             */
            POSSIBLE_TYPES: JSON.stringify(possibleTypes),
            STORE_NAME: availableStore
                ? JSON.stringify(availableStore.store_name)
                : JSON.stringify(storeConfigData.store_name),
            META_KEYWORDS: JSON.stringify('999Tee'),
            META_DESCRIPTION: JSON.stringify('999Tee'),
            STORE_VIEW_CODE: process.env.STORE_VIEW_CODE
                ? JSON.stringify(process.env.STORE_VIEW_CODE)
                : JSON.stringify(storeConfigData.code),
            AVAILABLE_STORE_VIEWS: JSON.stringify(availableStores),
            DEFAULT_LOCALE: JSON.stringify(global.LOCALE),
            DEFAULT_COUNTRY_CODE: JSON.stringify(
                process.env.DEFAULT_COUNTRY_CODE || 'US'
            )
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './template.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        })
    ];

    const serverConfig = Object.assign({}, config, {
        target: 'node',
        devtool: false,
        module: { ...config.module },
        name: 'server-config',
        output: {
            ...config.output,
            filename: '[name].[hash].SERVER.js',
            strictModuleExceptionHandling: true
        },
        optimization: {
            minimize: false
        },
        plugins: [...config.plugins]
    });

    // TODO: get LocalizationPlugin working in Node
    const browserPlugins = new Set()
        .add('HtmlWebpackPlugin')
        .add('LocalizationPlugin')
        .add('ServiceWorkerPlugin')
        .add('VirtualModulesPlugin')
        .add('WebpackAssetsManifest');

    // remove browser-only plugins
    serverConfig.plugins = serverConfig.plugins.filter(
        plugin => !browserPlugins.has(plugin.constructor.name)
    );

    // remove browser-only module rules
    serverConfig.module.rules = serverConfig.module.rules.map(rule => {
        if (`${rule.test}` === '/\\.css$/') {
            return {
                ...rule,
                oneOf: rule.oneOf.map(ruleConfig => ({
                    ...ruleConfig,
                    use: ruleConfig.use.filter(
                        loaderConfig => loaderConfig.loader !== 'style-loader'
                    )
                }))
            };
        } else if (`${rule.test}` === '/\\.(mjs|js|jsx)$/') {
            return {
                ...rule,
                loader: "babel-loader"
            }
        }

        return rule;
    });

    // add LimitChunkCountPlugin to avoid code splitting
    // serverConfig.plugins.push(
    //     new LimitChunkCountPlugin({
    //         maxChunks: 1
    //     })
    // );
    // config.output.publicPath = process.env.NODE_ENV !== 'production' ?
    //     'http://' + process.env.DEV_SERVER_HOST + ':9000/' :
    //     'https://' + process.env.STAGING_SERVER_HOST
    // config.output.pubilcPath = "http://localhost:9000/"

    // console.log('config.output', config.output.publicPath)
    config.plugins.push(new ModuleOverridePlugin(cedOverrideMapping));
    return [config];
};
