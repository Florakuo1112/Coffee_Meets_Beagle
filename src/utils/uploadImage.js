import { supabase } from 'utils/supabaseClient'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * 上傳圖片到 Supabase Storage，回傳可顯示的公開網址。
 * 大頭貼與寵物照片共用，呼叫端自行決定 bucket 與路徑。
 * @param {Event} event input[type=file] 的 change event
 * @param {{ bucket: string, path: string | ((file: File) => string), setUploading?: (uploading: boolean) => void, upsert?: boolean }} options
 * @returns {Promise<string>} 公開網址；未選檔或失敗時回傳空字串
 */
export const uploadImage = async (event, { bucket, path, setUploading, upsert = true } = {}) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return ''

  if (!file.type.startsWith('image/')) {
    alert('請上傳圖片檔')
    return ''
  }

  if (file.size > MAX_IMAGE_SIZE) {
    alert('圖片請小於 5MB')
    return ''
  }

  try {
    setUploading?.(true)

    const filePath = typeof path === 'function' ? path(file) : path
    console.log('filePath', filePath)
    if (!bucket || !filePath) throw new Error('缺少上傳位置')

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert,
      contentType: file.type
    })
    if (uploadError) {
      console.error('Storage 上傳失敗:', uploadError)
      throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return `${data.publicUrl}?t=${Date.now()}`
  } catch (error) {
    console.error('照片上傳失敗:', error)
    alert(`照片上傳失敗：${error.message || error.error || 'access denied'}`)
    return ''
  } finally {
    setUploading?.(false)
  }
}
