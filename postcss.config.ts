import pxtorem from 'postcss-pxtorem'

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    pxtorem({
      rootValue: 16, // 与 flexible 脚本保持一致：1rem = 16px
      propList: ['*'],
      selectorBlackList: ['.norem'],
      minPixelValue: 2,
      mediaQuery: false,
      exclude: /node_modules/i,
    }),
  ],
}

export default config
