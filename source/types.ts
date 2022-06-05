export interface Evidence {
  sourceUrl: string
  media: Video[]
}

export interface Video {
  content_type: string
  bitrate?: number
  thumbnail?: string
  url: string
}

export interface VideosFoundMessage {
  type: 'VIDEOS_FOUND'
  sourceUrl: string
  thumbnail: string
  media: Video[]
}

export type Message = VideosFoundMessage
