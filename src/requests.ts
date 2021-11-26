import { FetchOptions, GetLiveChatResponse } from "./types/yt-response"
import axios from "axios"

export async function fetchChat(options: FetchOptions): Promise<GetLiveChatResponse> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`

  return (
    await axios.post(url, {
      context: {
        client: {
          clientVersion: options.clientVersion,
          clientName: "WEB",
        },
      },
      continuation: options.continuation,
    })
  ).data
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string }): Promise<string> {
  const url =
    "channelId" in id
      ? `https://www.youtube.com/channel/${id.channelId}/live`
      : `https://www.youtube.com/watch?v=${id.liveId}`

  return (await axios.get(url)).data.toString()
}
