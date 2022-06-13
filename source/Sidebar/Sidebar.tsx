import React, { FC, useCallback, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import styled from 'styled-components'
import {
  Autocomplete,
  FormField,
  TextInput,
  TextInputField
} from 'evergreen-ui'
import { FoundMedia, Message } from '../types'
import { selectTopVideo } from '../lib/selectTopVideo'

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
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

const Sidebar: FC = () => {
  const [media, setMedia] = useState<FoundMedia>()

  const messageListener = useCallback((message: Message) => {
    if (message.type === 'MEDIA_FOUND') {
      const { type, ...contents } = message
      setMedia(contents)
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

  const video = selectTopVideo(media.video)

  return (
    <SidebarContainer>
      <TextInputField label="Link" value={media.sourceUrl} disabled />
      <TextInputField label="Video Link" value={video?.url ?? ''} disabled />
      <TextInputField
        label="Thumbnail"
        value={media.thumbnail ?? ''}
        disabled
      />
      <TextInputField label="Address - if known" value="" />
      <TextInputField label="Town" value="" />
      <FormField label="Oblast">
        <Autocomplete
          onChange={(changedItem) => console.log(changedItem)}
          items={[
            'Cherkasy Oblast',
            'Chernihiv Oblast',
            'Chernivtsi Oblast',
            'Dnipropetrovsk Oblast',
            'Donetsk Oblast',
            'Ivano-Frankivsk Oblast',
            'Kharkiv Oblast',
            'Kherson Oblast',
            'Khmelnytskyi Oblast',
            'Kyiv Oblast',
            'Kirovohrad Oblast',
            'Luhansk Oblast',
            'Lviv Oblast',
            'Mykolaiv Oblast',
            'Odessa Oblast',
            'Poltava Oblast',
            'Rivne Oblast',
            'Sumy Oblast',
            'Ternopil Oblast',
            'Vinnytsia Oblast',
            'Volyn Oblast',
            'Zakarpattia Oblast',
            'Zaporizhzhia Oblast',
            'Zhytomyr Oblast'
          ]}
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
    </SidebarContainer>
  )
}

export default Sidebar
