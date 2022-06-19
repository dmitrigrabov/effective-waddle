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

export interface FoundMediaMessage extends FoundMedia {
  type: 'MEDIA_FOUND'
}

export interface ArchiveLinkMessage {
  type: 'ARCHIVE_URL'
  url: string
}

export interface ArchiverLoadedMessage {
  type: 'ARCHIVER_LOADED'
  tabId: number
}

export type Message =
  | FoundMediaMessage
  | ArchiveLinkMessage
  | ArchiverLoadedMessage
