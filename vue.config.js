const pages = require('./pages.config')

const isProd = process.env.NODE_ENV === 'production'
const assetsCDN = {
  // webpack build externals
  externals: {
    vue: 'Vue',
    axios: 'axios',
    echarts: 'echarts',
  },
  css: [],
  js: [
    '//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
    '//cdn.jsdelivr.net/npm/axios@0.19.0/dist/axios.min.js',
    '//cdn.staticfile.org/echarts/4.3.0/echarts.min.js',
  ],
}

if (isProd) {
  for (let i in pages) {
    pages[i].cdn = assetsCDN
  }
}

const createPages = pages => {
  if (!pages) return {}
  const keys = Object.keys(pages)
  const config = {}
  keys.forEach(key => {
    config[key] = {
      ...pages[key],
      entry: `src/pages/${pages[key].entry || key}/main.js`,
      filename: pages[key].filename || `${key}.html`,
      chunks: pages[key].chunks
        ? ['chunk-vendors', 'chunk-common', ...pages[key].chunks]
        : ['chunk-vendors', 'chunk-common', key],
    }
  })
  return config
}

// vue.config.js
const vueConfig = {
  publicPath: './',
  productionSourceMap: false,
  lintOnSave: 'warning',
  pages: createPages(pages),

  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      })
    if (isProd) {
      config.merge({ externals: assetsCDN.externals })
    }
  },
  devServer: {
    proxy: {
      '/api': {
        // replace to your server ip
        target: 'http://192.168.1.127:3000/',
        ws: true,
        changeOrigin: true,
        pathRewrite: { '/api': '' },
      },
    },
  },
  css: {
    loaderOptions: {
      postcss: {
        ident: 'postcss',
        plugins: [
          require('autoprefixer')({}),
          require('postcss-px-to-viewport')({
            viewportWidth: 375,
            unitToConvert: 'rpx',
            viewportUnit: 'vw',
          }),
        ],
      },
      less: {
        // eslint-disable-next-line
        prependData: "@import '@/global.less';",
      },
    },
  },
}

module.exports = vueConfig
