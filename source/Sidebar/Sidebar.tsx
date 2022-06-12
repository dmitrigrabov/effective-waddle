import React, { FC, useCallback, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import styled from 'styled-components'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { pathToRegexp } from 'path-to-regexp'
import { Message, Video } from '../types'

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`

const EvidenceContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
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
  const [videos, setVideos] = useState<Record<string, Video>>({})

  const messageListener = useCallback((message: Message) => {
    if (message.type === 'VIDEOS_FOUND') {
      setVideos((existingVideos) => {
        const topVideo = selectTopVideo(message.media)

        if (!topVideo) {
          return existingVideos
        }

        return {
          ...existingVideos,
          [message.sourceUrl]: {
            ...topVideo,
            thumbnail: message.thumbnail
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    browser.runtime.onMessage.addListener(messageListener)

    return () => {
      if (!browser.runtime.onMessage.hasListener(messageListener)) {
        console.log('Listener not registered')
      }

      browser.runtime.onMessage.removeListener(messageListener)
    }
  }, [messageListener])

  if (!Object.keys(videos).length) {
    return <div>Discovered media urls will be displayed here</div>
  }

  return (
    <SidebarContainer>
      {Object.keys(videos).map((key) => {
        const regexp = pathToRegexp('/:username/status/:tweetId')

        console.log('Creating url for: ', JSON.stringify(key))
        const url = new URL(key)
        const result = regexp.exec(url.pathname)

        return (
          <EvidenceContainer key={key}>
            {result?.[2] ? <TwitterTweetEmbed tweetId={result[2]} /> : null}

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
