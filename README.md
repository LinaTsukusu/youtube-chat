# youtube-chat
> Fetch Youtube live chat without API

***You will need to take full responsibility for your action***

## Getting started
1. Install
    - `npm i youtube-chat`
    - `yarn add youtube-chat`
2. Import
    - Javascript
    ```javascript
    const LiveChat = require('youtube-chat').LiveChat
    ```
    - Typescript
    ```typescript
    import {LiveChat} from 'youtube-chat'
    ```
3. Create instance with ChannelID or LiveID
    ```javascript
    // If channelId is specified, liveId in the current stream is automatically acquired.
    const liveChat = new LiveChat({channelId: 'UCxkOLgdNumvVIQqn5ps_bJA?'})
    
    // Or specify LiveID in Stream manually.
    const liveChat = new LiveChat({liveId: 'bc5DoKBZRIo'})
    ```
4. Add events
    ```typescript
    // Emit at start of observation chat.
    // liveId: string
    liveChat.on('start', (liveId) => {})
   
    // Emit at end of observation chat.
    // reason: string?
    liveChat.on('end', (reason) => {})
    
    // Emit at receive chat.
    // comment: CommentItem
    liveChat.on('comment', (comment) => {})
    
    // Emit when an error occurs
    // err: Error
    liveChat.on('error', (err) => {})
    ```

## Types
### CommentItem
```typescript
interface CommentItem {
  id: string
  author: {
    name: string
    thumbnail?: ImageItem
    channelId: string
    badge?: {
      thumbnail: ImageItem
      label: string
    }
  }
  message: MessageItem[]
  superchat?: {
    amount: string
    color: number
  }
  membership: boolean
  isOwner: boolean
  timestamp: number
}
```

### MessageItem
```typescript
type MessageItem = { text: string } | ImageItem
```

### ImageItem
```typescript
interface ImageItem {
  url: string
  alt: string
  width: number
  height: number
}
```
