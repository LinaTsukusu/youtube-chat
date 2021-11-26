import { LiveChat } from "../src"
import axios from "axios"
import { readFileSync } from "fs"
import { ChatItem } from "../src/types/data"

jest.mock("axios")
const mockGet = axios.get as jest.Mock
mockGet.mockResolvedValue({ data: readFileSync(__dirname + "/testdata/live-page.html").toString() })
const mockPost = axios.post as jest.Mock
mockPost.mockResolvedValue({ data: require("./testdata/get_live_chat.normal.json") })

describe("LiveChat", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test("Constructor: LiveID", () => {
    const liveId = "liveId"
    const liveChat = new LiveChat({ liveId: liveId })
    expect(liveChat).toBeInstanceOf(LiveChat)
    expect(liveChat.liveId).toBe(liveId)
  })

  test("Constructor: ChannelID", () => {
    const liveChat = new LiveChat({ channelId: "channelId" })
    expect(liveChat).toBeInstanceOf(LiveChat)
  })

  test("Constructor: No IDs Error", () => {
    // eslint-disable-next-line
    // @ts-ignore
    expect(() => new LiveChat()).toThrow(TypeError)
  })

  test("Start", async () => {
    const spy = jest.spyOn(global, "setInterval")
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onStart = jest.fn()
    liveChat.on("start", onStart)
    const isStarted = await liveChat.start()
    expect(isStarted).toBe(true)
    expect(onStart).toHaveBeenCalledWith(expect.any(String))
    expect(setInterval).toHaveBeenCalled()
    spy.mockRestore()
  })

  test("Stop", async () => {
    const spy = jest.spyOn(global, "clearInterval")
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onEnd = jest.fn()
    liveChat.on("end", onEnd)
    await liveChat.start()
    liveChat.stop("STOP")
    expect(clearInterval).toHaveBeenCalled()
    expect(onEnd).toHaveBeenCalledWith("STOP")
    spy.mockRestore()
  })

  test("On chat", async () => {
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onChat = jest.fn()
    liveChat.on("chat", onChat)
    await liveChat.start()
    jest.advanceTimersToNextTimer(1000)
    const chatItem = await new Promise((resolve) => {
      onChat.mockImplementation((chatItem: ChatItem) => {
        resolve(chatItem)
      })
    })
    expect(chatItem).toMatchObject({
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [
        {
          text: "Hello, World!",
        },
      ],
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01"),
    })
  })

  test("On error", async () => {
    mockGet.mockImplementationOnce(() => {
      throw new Error("ERROR")
    })
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onError = jest.fn()
    liveChat.on("error", onError)
    const isStarted = await liveChat.start()
    expect(isStarted).toBe(false)
    expect(onError).toHaveBeenCalledWith(new Error("ERROR"))
  })
})
