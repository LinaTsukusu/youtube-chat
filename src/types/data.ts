/** 整形後の型 */

/** 取得したチャット詳細 */
export interface ChatItem {
  id: string
  author: {
    name: string
    thumbnail?: ImageItem
    channelId: string
    badge?: {
      thumbnail: ImageItem
      label: string
    }
  }
  message: MessageItem[]
  superchat?: {
    amount: string
    color: number
    sticker?: ImageItem
  }
  isMembership: boolean
  isVerified: boolean
  isOwner: boolean
  isModerator: boolean
  timestamp: Date
}

/** チャットメッセージの文字列or絵文字 */
export type MessageItem = { text: string } | ImageItem

/** 画像(絵文字) */
export interface ImageItem {
  url: string
  alt: string
}
