;(function () {
  const designWidth = 375 // 设计稿宽度
  const rootValue = 16 // tailwind 的基础字体大小
  const maxWidth = 750 // 最大显示宽度（对应 750px 设计稿或 2 倍 375px）

  function setRem() {
    const clientWidth = document.documentElement.clientWidth
    // 限制最大宽度
    const width = Math.min(clientWidth, maxWidth)
    const fontSize = (width / designWidth) * rootValue
    document.documentElement.style.fontSize = `${fontSize}px`
    document.documentElement.style.width = `${width}px`
    document.documentElement.style.margin = '0 auto'
  }

  setRem()
  window.addEventListener('resize', setRem)
})()
