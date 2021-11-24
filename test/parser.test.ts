import { parseChatData } from "../src/parser"


describe("Parser", () => {
  test("Normal", () => {
    const res = require("./testdata/get_live_chat.normal.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        text: "Hello, World!",
      }],
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("Included Global Emoji", () => {
    const res = require("./testdata/get_live_chat.emoji.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f44f.svg",
        alt: ":clapping_hands:",
        isCustomEmoji: false,
        emojiText: "👏",
      }],
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("Included Custom Emoji", () => {
    const res = require("./testdata/get_live_chat.custom-emoji.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        url: "https://custom.emoji.url",
        alt: ":customEmoji:",
        isCustomEmoji: true,
        emojiText: ":customEmoji:",
      }],
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("From Membership", () => {
    const res = require("./testdata/get_live_chat.from-member.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
        badge: {
          label: "メンバー（6 か月）",
          thumbnail: {
            url: "https://membership.badge.url",
            alt: "メンバー（6 か月）"
          }
        }
      },
      message: [{
        text: "Hello, World!",
      }],
      isMembership: true,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("Subscribe Membership", () => {
    const res = require("./testdata/get_live_chat.subscribe-member.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
        badge: {
          label: "新規メンバー",
          thumbnail: {
            url: "https://membership.badge.url",
            alt: "新規メンバー"
          }
        }
      },
      message: [
        {
          text: "上級エンジニア",
        },
        {
          text: " へようこそ！",
        },
      ],
      isMembership: true,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("Super Chat", () => {
    const res = require("./testdata/get_live_chat.super-chat.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        text: "Hello, World!",
      }],
      superchat: {
        amount: "￥1,000",
        color: "#FFCA28",
      },
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("Super Sticker", () => {
    const res = require("./testdata/get_live_chat.super-sticker.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [],
      superchat: {
        amount: "￥90",
        color:  "#1565C0",
        sticker: {
          url: "//super.sticker.url",
          alt: "superSticker"
        },
      },
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("From Verified User", () => {
    const res = require("./testdata/get_live_chat.from-verified.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        text: "Hello, World!",
      }],
      isMembership: false,
      isVerified: true,
      isOwner: false,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("From Moderator", () => {
    const res = require("./testdata/get_live_chat.from-moderator.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        text: "Hello, World!",
      }],
      isMembership: false,
      isVerified: false,
      isOwner: false,
      isModerator: true,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("From Owner", () => {
    const res = require("./testdata/get_live_chat.from-owner.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([{
      author: {
        name: "authorName",
        thumbnail: {
          url: "https://author.thumbnail.url",
          alt: "authorName",
        },
        channelId: "channelId",
      },
      message: [{
        text: "Hello, World!",
      }],
      isMembership: false,
      isVerified: false,
      isOwner: true,
      isModerator: false,
      timestamp: new Date("2021-01-01")
    }])
  })

  test("No Chat", () => {
    const res = require("./testdata/get_live_chat.no-chat.json")
    const [chatItems, continuation] = parseChatData(res)
    expect(continuation).toBe("test-continuation:01")
    expect(chatItems).toStrictEqual([])
  })
})
