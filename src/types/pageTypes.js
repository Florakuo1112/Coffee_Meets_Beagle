import { lazyRouteComponent } from '@tanstack/react-router'
/**
 * @enum {String}
 */
export const pageTypes = Object.freeze({
  home: 'home'
})

const getName = fnCode => {
  if (!fnCode) return ''
  if (fnCode === pageTypes.home) return '首頁'
  return ''
}

const pageList = [
  {
    pathname: '/home',
    key: pageTypes.home,
    label: getName(pageTypes.home),
    component: lazyRouteComponent(() => import('pages/Home'))
  }
]

/**
 * 透過 pathname 取得 key
 * @param {Array} pages
 * @param {String} key
 * @returns {String}
 */
const getKeyByPathname = (pages = [], pathname = '') => {
  return pages.find(page => page.pathname === pathname)?.key || ''
}

const PageTypes = {
  types: pageTypes,
  getName,
  pageList,
  getKeyByPathname
}

export default PageTypes
