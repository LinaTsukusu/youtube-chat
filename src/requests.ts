import { http } from "@tauri-apps/api"
import { parseChatData, getOptionsFromLivePage } from "./parser"
import { FetchOptions, GetLiveChatResponse } from "./types/yt-response"
import { ChatItem } from "./types/data"

export async function fetchChat(options: FetchOptions): Promise<[ChatItem[], string]> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`
  const res = await http.fetch(url, {
    method: "POST",
    responseType: http.ResponseType.JSON,
    headers: {
      "content-type": "application/json"
    },
    body: http.Body.json({
      context: {
        client: {
          clientVersion: options.clientVersion,
          clientName: "WEB",
        },
      },
      continuation: options.continuation,
    })
  })

  return parseChatData(res.data as GetLiveChatResponse);
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string }) {
  const url =
    "channelId" in id
      ? `https://www.youtube.com/channel/${id.channelId}/live`
      : `https://www.youtube.com/watch?v=${id.liveId}`
  const res = await http.fetch(url, { method: "GET", responseType: http.ResponseType.Text })
  return getOptionsFromLivePage(res.data as string)
}
