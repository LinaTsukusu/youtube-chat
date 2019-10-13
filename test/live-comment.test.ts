import {LiveComment} from 'src/index'


describe('channelId', () => {
  test('normal', () => {
    const liveComment = new LiveComment({channelId: ''})
    liveComment.start()
    liveComment.on('comment', (comment) => {
      console.log(comment.message)
    })
  })
})
