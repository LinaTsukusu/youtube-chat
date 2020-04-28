export interface Thumbnail {
  url: string
  width?: number
  height?: number
}

export interface MessageText {
  text: string
}

export interface MessageEmoji {
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

export type MessageRun = MessageText | MessageEmoji

export interface AuthorBadge {
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


export interface MessageRendererBase {
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

export interface LiveChatTextMessageRenderer extends MessageRendererBase{
  message: {
    runs: MessageRun[]
  }
  authorBadges?: AuthorBadge[]
}

export interface LiveChatPaidMessageRenderer extends LiveChatTextMessageRenderer {
  purchaseAmountText: {
    simpleText: string
  }
  headerBackgroundColor: number
  headerTextColor: number
  bodyBackgroundColor: number
  bodyTextColor: number
  authorNameTextColor: number
}

export interface LiveChatMembershipItemRenderer extends MessageRendererBase {
  headerSubtext: {
    runs: MessageRun[]
  }
  authorBadges: AuthorBadge[]
}

export interface ActionItem  {
  item: {
    liveChatTextMessageRenderer?: LiveChatTextMessageRenderer
    liveChatPaidMessageRenderer?: LiveChatPaidMessageRenderer
    liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer
  },
  clientId: string
}

export interface Action {
  addChatItemAction?: ActionItem
  addLiveChatTickerItemAction?: any
}
