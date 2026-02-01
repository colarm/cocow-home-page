export type Language = 'en-us' | 'en-gb' | 'zh-cn' | 'zh-tw' | 'zh-hk' | 'ja-jp' | 'ko-kr' | 'es-es' | 'fr-fr' | 'de-de' | 'pt-br' | 'ru-ru' | 'it-it' | 'ar-sa'

export interface Website {
  id: string
  name: string  // i18n key: websites.[id].name
  url: string
  icon: string
  categoryId: string
  tags?: string[]
  isFeatured?: boolean
}

export interface Category {
  id: string
  name: string  // i18n key: categories.[id].name
  icon: string
  order: number
}
