interface ImageItem {
  url: string
  alt: string
  width: number
  height: number
}

type MessageItem = { text: string } | ImageItem

interface CommentItem {
  id: string
  author: {
    name: string
    thumbnail: ImageItem
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
  }
  membership: boolean
  isOwner: boolean
  timestamp: number
}


function parseThumbnailToImageItem(data: Thumbnail[], authorName: string): ImageItem | null {
  const thumbnail = data.pop()
  if (thumbnail) {
    return {
      url: thumbnail.url,
      width: thumbnail.width!,
      height: thumbnail.height!,
      alt: authorName,
    }
  }
  return null
}

function parseEmojiToImageItem(data: MessageEmoji): ImageItem {

}

function actionToRenderer(action: Action): LiveChatTextMessageRenderer | LiveChatPaidMessageRenderer | LiveChatMembershipItemRenderer | null {
  if (!action.addChatItemAction) {
    return null
  }
  const item = action.addChatItemAction.item
  if (item.liveChatTextMessageRenderer) {
    return item.liveChatTextMessageRenderer
  } else if (item.liveChatPaidMessageRenderer) {
    return item.liveChatPaidMessageRenderer
  } else {
    return item.liveChatMembershipItemRenderer!
  }
}

function usecToTime(usec: string): number {
  return Math.floor(Number(usec) / 1000)
}

export function parseData(data: Action): CommentItem | null {
  const messageRenderer = actionToRenderer(data)
  if (messageRenderer === null) { return null }
  const message = 'message' in messageRenderer ? messageRenderer.message.runs : messageRenderer.headerSubtext.runs

  const ret: CommentItem = {
    id: messageRenderer.id,
    author: {
      name: messageRenderer.authorName.simpleText,
      thumbnail: {
        url: messageRenderer.authorPhoto.thumbnails.pop()!.url
      },
      channelId: messageRenderer.authorExternalChannelId,
    },
    message: message,
    membership: Boolean('headerSubtext' in messageRenderer),
    isOwner: false,
    timestamp: usecToTime(messageRenderer.timestampUsec),
  }

  if (messageRenderer.authorBadges) {
    const badge = messageRenderer.authorBadges[0].liveChatAuthorBadgeRenderer
    if (badge.customThumbnail) {
      ret.author.badge = {
        thumbnail: badge.customThumbnail.thumbnails.pop()!.url,
        label: badge.tooltip,
      }
    } else {
      ret.isOwner = true
    }
  }

  if ('purchaseAmountText' in messageRenderer) {
    ret.superchat = {
      amount: messageRenderer.purchaseAmountText.simpleText,
      color: messageRenderer.bodyBackgroundColor,
    }
  }

  return ret
})

items.forEach((v: CommentItem) => {
  this.emit('comment', v)
})

if (items.length > 0) {
  this.prevTime = items[items.length - 1].timestamp
}
}
