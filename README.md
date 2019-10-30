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
    liveChat.on('start', (liveId: string) => {})
    // Emit at end of observation chat.
    liveChat.on('end', (reason: string) => {})
    // Emit at receive chat.
    liveChat.on('comment', (comment: CommentItem) => {})
    // Emit when an error occurs
    liveChat.on('error', (err: Error) => {})
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
