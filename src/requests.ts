import axios from "axios"
import { parseChatData, getOptionsFromLivePage } from "./parser"
import { FetchOptions } from "./types/yt-response"
import { ChatItem } from "./types/data"

export async function fetchChat(options: FetchOptions): Promise<[ChatItem[], string]> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`
  const res = await axios.post(url, {
    context: {
      client: {
        clientVersion: options.clientVersion,
        clientName: "WEB",
      },
    },
    continuation: options.continuation,
  })

  return parseChatData(res.data)
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string }) {
  const url =
    "channelId" in id
      ? `https://www.youtube.com/channel/${id.channelId}/live`
      : `https://www.youtube.com/watch?v=${id.liveId}`
  const res = await axios.get(url)
  return getOptionsFromLivePage(res.data.toString())
}
