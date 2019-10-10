import {EventEmitter} from 'events'
import axios from 'axios'


interface CommentItem {
  authorName: string
  message: string
  time: Date
}


export class LiveComment extends EventEmitter {
  public readonly channelId?: string
  public liveId?: string
  public interval = 1000
  private prevTime = Date.now()
  private readonly headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'}
  private observer?: NodeJS.Timer

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

  public async startObserve() {
    if (this.channelId) {
      const liveRes = await axios.get(`https://www.youtube.com/channel/${this.channelId}/live`, {headers: this.headers})
      this.liveId = liveRes.data.match(/"watchEndpoint":{"videoId":"(\w*)"}/gm)[0].match(/"videoId":"(.*)"/)[1] as string
    }
    // TODO スパチャとか対応
    // TODO 情報量増やす
    // TODO 時間でfilterじゃなくてsliceする
    this.observer = setInterval(async () => {
      const res = await axios.get(`https://www.youtube.com/live_chat?v=${this.liveId}&pbj=1`, {headers: this.headers})
      // console.log(res)
      const items = res.data[1].response.contents.liveChatRenderer.actions.slice(0, -1)
      items.filter((v: any) => {
          try {
            return LiveComment.usecToTime(v.addChatItemAction.item.liveChatTextMessageRenderer.timestampUsec) >= this.prevTime
          } catch (e) {
            return false
          }
        })
        .map((v: any) => {
          const item = v.addChatItemAction.item.liveChatTextMessageRenderer
          return {
            authorName: item.authorName.simpleText,
            message: item.message.runs[0].text,
            time: new Date(LiveComment.usecToTime(v.addChatItemAction.item.liveChatTextMessageRenderer.timestampUsec)),
          }
        }).forEach((v: CommentItem) => {
          this.emit('comment', v)
          this.prevTime = v.time.getTime() + 1
        })
    }, this.interval)
  }

  private static usecToTime(usec: string): number {
    return Number(usec) / 1000
  }
}
