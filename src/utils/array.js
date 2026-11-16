/**
 * 判斷 是否為array && array至少有一個值
 * @param {Array} array
 * @returns {Boolean}
 */
export const isNotEmptyArray = array => Boolean(Array.isArray(array) && array.length > 0)

/**
 * 判斷 兩個array是否相等
 * @param {Array} arr1 - 第一個array
 * @param {Array} arr2 - 第二個array
 * @returns {Boolean} - 如果兩個array的元素完全相同（不計順序），則返回true，否則返回false
 */
export const isArrayEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false
  const sortedArr1 = [...arr1].sort()
  const sortedArr2 = [...arr2].sort()
  return sortedArr1.every((value, index) => value === sortedArr2[index])
}
