import React, { FC, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import { Message, Video } from '../types'

const Sidebar: FC = () => {
  const [videos, setVideos] = useState<Record<string, Record<string, Video>>>(
    {}
  )

  useEffect(() => {
    browser.runtime.onMessage.addListener((message: Message) => {
      if (message.type === 'VIDEOS_FOUND') {
        setVideos((existingVideos) => {
          const matchingSource = existingVideos[message.sourceUrl] ?? {}

          const updatedSource = message.media.reduce((acc, mediaItem) => {
            return {
              ...acc,
              [mediaItem.url]: mediaItem
            }
          }, matchingSource)

          return {
            ...existingVideos,
            [message.sourceUrl]: updatedSource
          }
        })
      }
    })
  })

  if (!Object.keys(videos).length) {
    return <div>Discovered media urls will be displayed here</div>
  }

  return (
    <div>
      {Object.keys(videos).map((key) => (
        <div key={key}>
          <div>{key}</div>
          {Object.values(videos[key]).map((video) => (
            <div key={video.url}>{video.url}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Sidebar
