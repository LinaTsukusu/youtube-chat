interface Thumbnail {
  url: string
  width?: number
  height?: number
}

interface MessageText {
  text: string
}

interface MessageEmoji {
  emoji: {
    emojiId: string
    shortcuts: string[]
    searchTerms: string[]
    image: {
      thumbnails: Thumbnail[]
      accessibility: {
        accessibilityData: {
          label: string
        }
      }
    }
    isCustomEmoji: true
  }
}

type MessageRun = MessageText | MessageEmoji

interface AuthorBadge {
  liveChatAuthorBadgeRenderer: {
    customThumbnail?: {
      thumbnails: Thumbnail[]
    },
    icon?: {
      iconType: string
    }
    tooltip: string
    accessibility: {
      accessibilityData: {
        label: string
      }
    }
  }
}


interface MessageRendererBase {
  authorName: {
    simpleText: string
  }
  authorPhoto: {
    thumbnails: Thumbnail[]
  }
  contextMenuEndpoint: {
    clickTrackingParams: string
    commandMetadata: {
      webCommandMetadata: {
        ignoreNavigation: true
      }
    }
    liveChatItemContextMenuEndpoint: {
      params: string
    }
  }
  id: string
  timestampUsec: string
  authorExternalChannelId: string
  contextMenuAccessibility: {
    accessibilityData: {
      label: string
    }
  }
}

interface LiveChatTextMessageRenderer extends MessageRendererBase{
  message: {
    runs: MessageRun[]
  }
  authorBadges?: AuthorBadge[]
}

interface LiveChatPaidMessageRenderer extends LiveChatTextMessageRenderer {
  purchaseAmountText: {
    simpleText: string
  }
  headerBackgroundColor: number
  headerTextColor: number
  bodyBackgroundColor: number
  bodyTextColor: number
  authorNameTextColor: number
}

interface LiveChatPaidStickerRenderer extends LiveChatTextMessageRenderer {
  purchaseAmountText: {
    simpleText: string
  }
  moneyChipBackgroundColor: number
  moneyChipTextColor: number
  stickerDisplayWidth: number
  stickerDisplayHeight: number
  backgroundColor: number
  authorNameTextColor: number
}

interface LiveChatMembershipItemRenderer extends MessageRendererBase {
  headerSubtext: {
    runs: MessageRun[]
  }
  authorBadges: AuthorBadge[]
}

interface ActionItem  {
  item: {
    liveChatTextMessageRenderer?: LiveChatTextMessageRenderer
    liveChatPaidMessageRenderer?: LiveChatPaidMessageRenderer
    liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer
    liveChatPaidStickerRenderer?: LiveChatPaidStickerRenderer
  },
  clientId: string
}

interface Action {
  addChatItemAction?: ActionItem
  addLiveChatTickerItemAction?: any
}
