import { browser, WebRequest } from 'webextension-polyfill-ts'
import { VideosFoundMessage } from '../types'

const listener = ({
  url,
  documentUrl,
  requestId
}: WebRequest.OnBeforeRequestDetailsType) => {
  const detailsPath =
    /^https:\/\/twitter.com\/i\/api\/graphql\/[0-9a-z_]*\/TweetDetail\?/gi

  const statusPath = /^https:\/\/twitter.com\/[0-9a-z_]+\/status\/[0-9]*/gi

  if (!detailsPath.test(url) || !documentUrl || !statusPath.test(documentUrl)) {
    return
  }

  const filter = browser.webRequest.filterResponseData(requestId)
  const decoder = new TextDecoder('utf-8')
  const encoder = new TextEncoder()

  filter.ondata = (event) => {
    const str = decoder.decode(event.data, { stream: true })

    filter.write(encoder.encode(str))
    filter.disconnect()

    const tweet = JSON.parse(str)

    const videos =
      tweet?.data?.threaded_conversation_with_injections_v2?.instructions?.[0]
        ?.entries?.[0]?.content?.itemContent?.tweet_results?.result?.legacy
        ?.extended_entities?.media?.[0]?.video_info?.variants

    if (!videos?.length) {
      return
    }

    const videoFoundMessage: VideosFoundMessage = {
      type: 'VIDEOS_FOUND',
      sourceUrl: documentUrl,
      media: videos
    }

    browser.runtime.sendMessage(undefined, videoFoundMessage)
  }
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://twitter.com/i/api/graphql/*'],
    types: ['xmlhttprequest']
  },
  ['blocking']
)
