import { fetchLivePage, fetchChat } from "../src/requests"
import axios from "axios"

jest.mock("axios")

describe("requests", () => {
  describe("fetchChat", () => {
    test("Request", async () => {
      const mockPost = axios.post as jest.Mock
      mockPost.mockResolvedValue({ data: "responseData" })
      const options = {
        apiKey: "apiKey",
        clientVersion: "clientVersion",
        continuation: "continuation",
      }
      const res = await fetchChat(options)
      expect(mockPost).toHaveBeenCalledWith(
        `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`,
        {
          context: {
            client: {
              clientVersion: options.clientVersion,
              clientName: "WEB",
            },
          },
          continuation: options.continuation,
        }
      )
      expect(res).toEqual("responseData")
    })
  })

  describe("fetchLivePage", () => {
    test("ChannelID request", async () => {
      const mockGet = axios.get as jest.Mock
      mockGet.mockResolvedValue({ data: "responseData" })
      const res = await fetchLivePage({ channelId: "channelId" })
      expect(mockGet).toHaveBeenCalledWith("https://www.youtube.com/channel/channelId/live")
      expect(res).toEqual("responseData")
    })

    test("LiveID request", async () => {
      const mockGet = axios.get as jest.Mock
      mockGet.mockResolvedValue({ data: "responseData" })
      const res = await fetchLivePage({ liveId: "liveId" })
      expect(mockGet).toHaveBeenCalledWith("https://www.youtube.com/watch?v=liveId")
      expect(res).toEqual("responseData")
    })
  })
})
