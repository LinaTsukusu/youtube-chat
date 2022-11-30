import { LiveChat } from "../src"
import { ChatItem } from "../src/types/data"

jest.mock("../src/requests")
import { fetchChat, fetchLivePage } from "../src/requests"

const mockFetchChat = fetchChat as jest.Mock
mockFetchChat.mockResolvedValue([
  [
    {
      id: "id",
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
    },
  ],
  "continuation",
])
const mockFetchLivePage = fetchLivePage as jest.Mock
mockFetchLivePage.mockResolvedValue({
  liveId: "liveId",
  apiKey: "apiKey",
  clientVersion: "clientVersion",
  continuation: "continuation",
})

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
    expect(() => new LiveChat()).toThrow("Required channelId or liveId or handle.")
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

  test("Start Second time", async () => {
    const spy = jest.spyOn(global, "setInterval")
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onStart = jest.fn()
    liveChat.on("start", onStart)
    await liveChat.start()
    const secondStart = await liveChat.start()
    expect(secondStart).toBe(false)
    expect(onStart).toHaveBeenCalledTimes(1)
    liveChat.stop()
    const startAfterStop = await liveChat.start()
    expect(startAfterStop).toBe(true)
    expect(onStart).toHaveBeenCalledTimes(2)
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
      id: "id",
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
    mockFetchLivePage.mockRejectedValueOnce(new Error("ERROR"))
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onError = jest.fn()
    liveChat.on("error", onError)
    const isStarted = await liveChat.start()
    expect(isStarted).toBe(false)
    expect(onError).toHaveBeenCalledWith(new Error("ERROR"))
  })

  test("Error: on chat", async () => {
    mockFetchChat.mockRejectedValueOnce(new Error("ERROR"))
    const liveChat = new LiveChat({ channelId: "channelId" })
    const onError = jest.fn()
    liveChat.on("error", onError)
    await liveChat.start()
    jest.advanceTimersToNextTimer(1000)
    await new Promise((resolve) => {
      onError.mockImplementation((err: unknown) => {
        resolve(err)
      })
    })
    expect(onError).toHaveBeenCalled()
  })
})
