import {EventEmitter} from 'events'
import axios from 'axios'


/**
 * YouTubeライブチャット取得イベント
 */
export class LiveComment extends EventEmitter {
  private static readonly headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'}
  public readonly channelId?: string
  public liveId?: string
  private prevTime = Date.now()
  private observer?: NodeJS.Timeout

  constructor(options: {channelId: string} | {liveId: string}, private interval = 1000) {
    super()
    if ('channelId' in options) {
      this.channelId = options.channelId
    } else if ('liveId' in options) {
      this.liveId = options.liveId
    } else {
      throw TypeError("Required channelId or liveId.")
    }
  }

  public async start(): Promise<boolean> {
    if (this.channelId) {
      const liveRes = await axios.get(`https://www.youtube.com/channel/${this.channelId}/live`, {headers: LiveComment.headers})
      if (liveRes.data.match(/LIVE_STREAM_OFFLINE/)) {
        this.emit('error', new Error("Live stream offline"))
        return false
      }
      this.liveId = liveRes.data.match(/<meta property="og:image" content="https:\/\/i\.ytimg\.com\/vi\/([^\/]*)\//)[1] as string
    }

    if (!this.liveId) {
      this.emit('error', new Error('Live stream not found'))
      return false
    }

    this.observer = setInterval(() => this.fetchChat(), this.interval)

    this.emit('start', this.liveId)
    return true
  }

  public stop(reason?: string) {
    if (this.observer) {
      clearInterval(this.observer)
      this.emit('end', reason)
    }
  }

  private async fetchChat() {
    const res = await axios.get(`https://www.youtube.com/live_chat?v=${this.liveId}&pbj=1`, {headers: LiveComment.headers})
    if (res.data[1].response.contents.messageRenderer) {
      this.stop("Live stream is finished")
      return
    }

    const items = res.data[1].response.contents.liveChatRenderer.actions
      .slice(0, -1)
      .filter((v: Action) => {
        const messageRenderer = LiveComment.actionToRenderer(v)
        if (messageRenderer !== null) {
          if (messageRenderer) {
            return LiveComment.usecToTime(messageRenderer.timestampUsec) > this.prevTime
          }
        }
        return false
      })
      .map((v: Action) => {
        const messageRenderer = LiveComment.actionToRenderer(v)
        if (messageRenderer === null) { return }


        const message = 'message' in messageRenderer ? messageRenderer.message.runs : messageRenderer.headerSubtext.runs

        const data: CommentItem = {
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

        if ('purchaseAmountText' in messageRenderer) {
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
      this.prevTime = items[items.length - 1].timestamp
    }
  }

  private static usecToTime(usec: string): number {
    return Math.floor(Number(usec) / 1000)
  }

  private static actionToRenderer(action: Action): LiveChatTextMessageRenderer | LiveChatPaidMessageRenderer | LiveChatMembershipItemRenderer | null {
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

  public on(event: 'comment', listener: (comment: CommentItem) => void): this
  public on(event: 'start', listener: (liveId: string) => void): this
  public on(event: 'end', listener: (reason?: string) => void): this
  public on(event: 'error', listener: (err: Error) => void): this
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener)
  }
}
