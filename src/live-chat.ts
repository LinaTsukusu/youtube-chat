import { EventEmitter } from "events"
import axios from "axios"
import { parseChatData } from "./parser"
import { ChatItem } from "./types/data"
import { GetLiveChatResponse } from "./types/yt-response"


/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends EventEmitter {
  readonly channelId?: string
  liveId?: string
  #observer?: NodeJS.Timer
  #continuation?: string
  #apiKey?: string
  #clientVersion?: string

  constructor(options: { channelId: string } | { liveId: string }, private interval = 1000) {
    super()
    if ("channelId" in options) {
      this.channelId = options.channelId
    } else if ("liveId" in options) {
      this.liveId = options.liveId
    } else {
      throw TypeError("Required channelId or liveId.")
    }
  }

  async start(): Promise<boolean> {
    try {
      const livePage = await this.#fetchLivePage()
      this.#getOptionsFromLivePage(livePage)

      this.#observer = setInterval(() => this.#execute(), this.interval)

      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stop(reason?: string) {
    if (this.#observer) {
      clearInterval(this.#observer)
      this.emit("end", reason)
    }
  }

  on(event: "chat", listener: (chatItem: ChatItem) => void): this
  on(event: "start", listener: (liveId: string) => void): this
  on(event: "end", listener: (reason?: string) => void): this
  on(event: "error", listener: (err: Error) => void): this
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener)
  }

  async #execute() {
    try {
      const data = await this.#fetchChat()
      const [chatItems, continuation] = parseChatData(data)
      chatItems.forEach(chatItem => this.emit("chat", chatItem))

      if (continuation) {
        this.#continuation = continuation
      }
    } catch (err) {
      this.emit("error", err)
    }
  }

  async #fetchChat(): Promise<GetLiveChatResponse> {
    const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${this.#apiKey}`

    return (await axios.post(url, {
      context: {
        client: {
          clientVersion: this.#clientVersion,
          clientName: "WEB",
        },
      },
      continuation: this.#continuation,
    })).data
  }

  async #fetchLivePage(): Promise<string> {
    const url = this.channelId ?
        `https://www.youtube.com/channel/${this.channelId}/live` :
        `https://www.youtube.com/watch?v=${this.liveId}`

    return (await axios.get(url)).data
  }

  #getOptionsFromLivePage(data: string) {
    if (!this.liveId) {
      const idResult = data.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=(.+?)">/)
      if (idResult) {
        this.liveId = idResult[1]
      } else {
        // Maybe it is an replay
        throw new Error("Live ID was not found")
      }
    }

    const keyResult = data.match(/['"]INNERTUBE_API_KEY['"]:\s*['"](.+?)['"]/)
    if (keyResult) {
      this.#apiKey = keyResult[1]
    } else {
      throw new Error("API Key was not found")
    }

    const verResult = data.match(/['"]clientVersion['"]:\s*['"]([\d.]+?)['"]/)
    if (verResult) {
      this.#clientVersion = verResult[1]
    } else {
      throw new Error("Client Version was not found")
    }

    const continuationResult = data.match(/['"]continuation['"]:\s*['"](.+?)['"]/)
    if (continuationResult) {
      this.#continuation = continuationResult[1]
    } else {
      throw new Error("Continuation was not found")
    }
  }
}
