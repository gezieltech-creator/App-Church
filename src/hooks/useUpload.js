import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState(null)

  async function upload(bucket, path, file, maxSizeMB = 5) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`)
    }
    if (!TIPOS_ACEITOS.includes(file.type)) {
      throw new Error('Formato não aceito. Use JPG, PNG, WebP ou SVG.')
    }

    setUploading(true)
    setErro(null)
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } catch (e) {
      setErro(e.message)
      throw e
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, erro }
}
