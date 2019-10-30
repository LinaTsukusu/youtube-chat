import {EventEmitter} from 'events'
import axios from 'axios'
import {actionToRenderer, CommentItem, parseData, usecToTime} from './parser'


/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends EventEmitter {
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
      const liveRes = await axios.get(`https://www.youtube.com/channel/${this.channelId}/live`, {headers: LiveChat.headers})
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
    const res = await axios.get(`https://www.youtube.com/live_chat?v=${this.liveId}&pbj=1`, {headers: LiveChat.headers})
    if (res.data[1].response.contents.messageRenderer) {
      this.stop("Live stream is finished")
      return
    }

    const items = res.data[1].response.contents.liveChatRenderer.actions.slice(0, -1)
      .filter((v: Action) => {
        const messageRenderer = actionToRenderer(v)
        if (messageRenderer !== null) {
          if (messageRenderer) {
            return usecToTime(messageRenderer.timestampUsec) > this.prevTime
          }
        }
        return false
      })
      .map((v: Action) => parseData(v))

    items.forEach((v: CommentItem) => {
      this.emit('comment', v)
    })

    if (items.length > 0) {
      this.prevTime = items[items.length - 1].timestamp
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
