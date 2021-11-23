# youtube-chat
> Fetch YouTube live chat without API

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
    // Recommended
    const liveChat = new LiveChat({channelId: 'UCxkOLgdNumvVIQqn5ps_bJA'})
    
    // Or specify LiveID in Stream manually.
    const liveChat = new LiveChat({liveId: 'bc5DoKBZRIo'})
    ```
4. Add events
    ```typescript
    // Emit at start of observation chat.
    // liveId: string
    liveChat.on('start', (liveId) => {
      /* Your code here! */
    })
   
    // Emit at end of observation chat.
    // reason: string?
    liveChat.on('end', (reason) => {
      /* Your code here! */
    })
    
    // Emit at receive chat.
    // chat: ChatItem
    liveChat.on('chat', (chatItem) => {
      /* Your code here! */
    })
    
    // Emit when an error occurs
    // err: Error
    liveChat.on('error', (err) => {
      /* Your code here! */
    })
    ```
5. Start
    ```typescript
    // Start fetch loop
    const ok = await liveChat.start()
    if (!ok) {
      console.log("Failed to start, check emitted error")
    }
    ```

## Types
### ChatItem
```typescript
interface ChatItem {
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
  isMembership: boolean
  isVerified: boolean
  isOwner: boolean
  isModerator: boolean
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
}
```
