interface FriendLink {
  name: string
  url: `https://${string}` | `http://${string}`
  description: string
  avatar?: `https://${string}` | `http://${string}`
}

export const friends: readonly FriendLink[] = [
  {
    name: '王泽丰的空间',
    url: 'https://zhejianglao.cn/',
    description: '忽如一夜春风来，千树万树梨花开。',
    avatar: 'https://zhejianglao.cn/favicon.ico',
  },
]
