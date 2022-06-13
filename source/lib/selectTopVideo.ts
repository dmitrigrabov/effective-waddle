import { Video } from '../types'

export const selectTopVideo = (videos: Video[]) => {
  return videos.reduce<Video | null>((acc, video) => {
    if (acc === null) {
      return video
    }

    if (
      acc.content_type === 'application/x-mpegURL' &&
      video.content_type === 'video/mp4'
    ) {
      return video
    }

    if (
      acc.content_type === 'video/mp4' &&
      video.content_type === 'video/mp4' &&
      video.bitrate &&
      acc.bitrate &&
      video.bitrate > acc.bitrate
    ) {
      return video
    }

    return acc
  }, null)
}
