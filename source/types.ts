export interface Evidence {
  sourceUrl: string
  media: Video[]
}

export interface Video {
  content_type: string
  bitrate?: number
  url: string
}

export interface FoundMedia {
  sourceUrl: string
  thumbnail: string
  video: Video[]
}

export interface VideosFoundMessage {
  type: 'VIDEOS_FOUND'
  sourceUrl: string
  thumbnail: string
  media: Video[]
}

export interface FoundMediaMessage {
  type: 'MEDIA_FOUND'
  sourceUrl: string
  thumbnail: string
  video: Video[]
}

export type Message = VideosFoundMessage | FoundMediaMessage
