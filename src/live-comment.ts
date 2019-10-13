import {EventEmitter} from 'events'
import axios from 'axios'


/**
 * YouTubeライブコメント取得イベント
 */
export class LiveComment extends EventEmitter {
  public readonly channelId?: string
  public liveId?: string
  public interval = 1000
  private prevTime = Date.now()
  private readonly headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'}
  private observer?: NodeJS.Timeout

  constructor(options: {channelId?: string, liveId?: string}) {
    super()
    if (options.channelId) {
      this.channelId = options.channelId
    } else if (options.liveId) {
      this.liveId = options.liveId
    } else {
      throw TypeError("Required channelId or liveId.")
    }
  }

  public async startObserve(): Promise<boolean> {
    if (this.channelId) {
      const liveRes = await axios.get(`https://www.youtube.com/channel/${this.channelId}/live`, {headers: this.headers})
      if (liveRes.data.match(/LIVE_STREAM_OFFLINE/)) {
        this.emit('error', new Error("LIVE_STREAM_OFFLINE"))
        return false
      }
      this.liveId = liveRes.data.match(/<meta property="og:image" content="https:\/\/i\.ytimg\.com\/vi\/([^\/]*)\//)[1] as string
    }

    this.observer = setInterval(async () => {
      const res = await axios.get(`https://www.youtube.com/live_chat?v=${this.liveId}&pbj=1`, {headers: this.headers})
      if (res.data[1].response.contents.messageRenderer) {
        clearInterval(this.observer!)
        this.emit('end')
        return
      }
      let items = res.data[1].response.contents.liveChatRenderer.actions.slice(0, -1)

      items = items.filter((v: Action) => {
        if (v.addChatItemAction) {
          const item = v.addChatItemAction.item
          const messageRenderer = item.liveChatTextMessageRenderer || item.liveChatPaidMessageRenderer || item.liveChatMembershipItemRenderer
          if (messageRenderer) {
            return LiveComment.usecToTime(messageRenderer.timestampUsec) >= this.prevTime
          }
        }

        return false
      }).map((v: Action) => {
        const item = v.addChatItemAction!.item
        const messageRenderer = item.liveChatTextMessageRenderer || item.liveChatPaidMessageRenderer || item.liveChatMembershipItemRenderer
        if (!messageRenderer) { return }
        const message = LiveComment.isMessage(messageRenderer!) ? messageRenderer!.message.runs : messageRenderer!.headerSubtext.runs
        const data: CommentItem = {
          id: messageRenderer!.id,
          author: {
            name: messageRenderer.authorName.simpleText,
            thumbnail: messageRenderer.authorPhoto.thumbnails.pop()!.url,
            channelId: messageRenderer.authorExternalChannelId,
          },
          message: message,
          membership: Boolean(item.liveChatMembershipItemRenderer),
          isOwner: false,
          timestamp: LiveComment.usecToTime(messageRenderer.timestampUsec),
        }

        if (messageRenderer.authorBadges) {
          const badge = messageRenderer.authorBadges[0].liveChatAuthorBadgeRenderer
          if (badge.customThumbnail) {
            data.author.badge = {
              thumbnail: badge.customThumbnail.thumbnails.pop()!.url,
              label: badge.tooltip,
            }
          } else {
            data.isOwner = true
          }
        }

        if (LiveComment.isPaid(messageRenderer)) {
          data.superchat = {
            amount: messageRenderer.purchaseAmountText.simpleText,
            color: messageRenderer.bodyBackgroundColor,
          }
        }

        return data
      })

      items.forEach((v: CommentItem) => {
        this.emit('comment', v)
      })
      if (items.length > 0) {
        this.prevTime = items[items.length - 1].timestamp + 1
      }
    }, this.interval)

    this.emit('start', this.liveId)
    return true
  }

  private static usecToTime(usec: string): number {
    return Math.floor(Number(usec) / 1000)
  }

  private static isMessage(renderer: LiveChatTextMessageRenderer | LiveChatPaidMessageRenderer | LiveChatMembershipItemRenderer)
    : renderer is LiveChatTextMessageRenderer | LiveChatPaidMessageRenderer {
    return renderer.hasOwnProperty("message")
  }

  private static isPaid(renderer: LiveChatTextMessageRenderer | LiveChatPaidMessageRenderer | LiveChatMembershipItemRenderer)
    : renderer is LiveChatPaidMessageRenderer {
    return renderer.hasOwnProperty("purchaseAmountText")
  }
}
