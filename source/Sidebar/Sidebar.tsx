import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import styled from 'styled-components'
import {
  Autocomplete,
  Button,
  FormField,
  TextInput,
  TextInputField
} from 'evergreen-ui'
import { FoundMedia, Message } from '../types'
import { selectTopVideo } from '../lib/selectTopVideo'
import oblasts from './oblasts'

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
`

const Sidebar: FC = () => {
  const [media, setMedia] = useState<FoundMedia>()
  const [archiveTabId, setArchiveTabId] = useState<number>()

  const messageListener = useCallback(
    (message: Message) => {
      console.log('MESSAGE: ', message)

      if (message.type === 'MEDIA_FOUND') {
        const { type, ...contents } = message
        setMedia(contents)
      }

      if (
        message.type === 'ARCHIVER_LOADED' &&
        media?.sourceUrl &&
        archiveTabId
      ) {
        browser.tabs.sendMessage(archiveTabId, {
          type: 'ARCHIVE_URL',
          url: media.sourceUrl
        })
      }
    },
    [media?.sourceUrl, archiveTabId]
  )

  useEffect(() => {
    browser.runtime.onMessage.addListener(messageListener)
    console.log('Sidebar subscribed')

    return () => {
      console.log('Running unsub')
      if (!browser.runtime.onMessage.hasListener(messageListener)) {
        console.log('Listener not registered')
      }

      browser.runtime.onMessage.removeListener(messageListener)
      console.log('Sidebar unsubscribed')
    }
  }, [messageListener])

  if (!media) {
    return (
      <SidebarContainer>
        Uploads available for urls that include video content and match pattern
        below
        <ul>
          <li>https://twitter.com/:accountName/status/:postId</li>
        </ul>
      </SidebarContainer>
    )
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const archiveUrl = 'https://archive.ph/'

    const listener = (tabId: number) => {
      console.log('TAB open: ', tabId)

      setArchiveTabId(tabId)

      browser.tabs.onUpdated.removeListener(listener)
    }

    browser.tabs.onUpdated.addListener(listener, {
      urls: [archiveUrl]
    })

    browser.tabs.create({ url: archiveUrl })
  }

  const video = selectTopVideo(media.video)

  return (
    <SidebarContainer>
      <form onSubmit={onSubmit}>
        <TextInputField
          label="Link"
          value={media.sourceUrl}
          disabled
          readOnly
        />
        <TextInputField
          label="Video Link"
          value={video?.url ?? ''}
          disabled
          readOnly
        />
        <TextInputField
          label="Thumbnail"
          value={media.thumbnail ?? ''}
          disabled
          readOnly
        />
        <TextInputField label="Address - if known" value="" />
        <TextInputField label="Town" value="" />
        <FormField label="Oblast">
          <Autocomplete
            onChange={(changedItem) => console.log(changedItem)}
            items={oblasts}
          >
            {(props) => {
              const { getInputProps, getRef, openMenu } = props

              return (
                <TextInput
                  width="100%"
                  ref={getRef}
                  {...getInputProps({
                    onFocus: () => {
                      openMenu()
                    },
                    onBlur: () => {},
                    onKeyDown: () => {},
                    onChange: () => {}
                  })}
                />
              )
            }}
          </Autocomplete>
        </FormField>
        <ButtonsContainer>
          <Button type="submit" appearance="primary">
            Save
          </Button>
        </ButtonsContainer>
      </form>
    </SidebarContainer>
  )
}

export default Sidebar
