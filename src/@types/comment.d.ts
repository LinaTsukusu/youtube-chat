interface CommentItem {
  id: string
  author: {
    name: string
    thumbnail: string
    channelId: string
    badge?: {
      thumbnail: string
      label: string
    }
  }
  message: any[]
  superchat?: {
    amount: string
    color: number
  }
  membership: boolean
  isOwner: boolean
  timestamp: number
}
