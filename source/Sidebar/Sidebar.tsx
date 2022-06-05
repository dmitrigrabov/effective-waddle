import React, { FC, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import styled from 'styled-components'
import { Message, Video } from '../types'

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`

const EvidenceContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
`

const EvidenceHeader = styled.div`
  display: flex;
  padding-bottom: 16px;
  font-size: 20px;
`

const Thumbnail = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  margin-bottom: 16px;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Button = styled.button`
  display: flex;
  width: fit-content;
  margin-left: 8px;
`

const selectTopVideo = (videos: Video[]) => {
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
              [mediaItem.url]: {
                ...mediaItem,
                thumbnail: message.thumbnail
              }
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
    <SidebarContainer>
      {Object.keys(videos).map((key) => {
        const topVideo = selectTopVideo(Object.values(videos[key]))

        if (!topVideo) {
          return null
        }

        const { thumbnail } = topVideo

        return (
          <EvidenceContainer key={key}>
            <EvidenceHeader>{key}</EvidenceHeader>
            {thumbnail ? <Thumbnail src={thumbnail} alt="" /> : null}

            <ButtonsContainer>
              <Button type="button">Archive</Button>
              <Button
                type="button"
                onClick={() => browser.tabs.create({ url: key })}
              >
                View
              </Button>
            </ButtonsContainer>
          </EvidenceContainer>
        )
      })}
    </SidebarContainer>
  )
}

export default Sidebar
