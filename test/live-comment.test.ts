import {LiveChat} from "../src"


describe('channelId', () => {
  test('normal', () => {
    const liveComment = new LiveChat({channelId: ''})
    liveComment.start()
    liveComment.on('comment', (comment) => {
      console.log(comment.message)
    })
  })
})
