import {LiveComment} from 'src/index'


describe('channelId', () => {
  test('normal', () => {
    const liveComment = new LiveComment({channelId: ''})
    liveComment.startObserve()
    liveComment.on('comment', (comment) => {
      console.log(comment.message)
    })
  })
})
