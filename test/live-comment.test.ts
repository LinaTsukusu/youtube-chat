import {LiveComment} from 'src/index'


describe('channelId', () => {
  test('normal', () => {
    const liveComment = new LiveComment({channelId: 'UCLpYMk5h1bq8_GAFVBgXhPQ'})
    liveComment.startObserve()
    liveComment.on('comment', (comment) => {
      console.log(comment.message)
    })
  })
})
