import { browser, WebRequest } from 'webextension-polyfill-ts'
import { VideosFoundMessage } from '../types'

browser.webRequest.onBeforeRequest.addListener(
  ({ url, documentUrl, requestId }: WebRequest.OnBeforeRequestDetailsType) => {
    const detailsPath =
      /^https:\/\/twitter.com\/i\/api\/graphql\/[0-9a-z_]*\/TweetDetail\?/gi

    const statusPath = /^https:\/\/twitter.com\/[0-9a-z_]+\/status\/[0-9]*/gi

    if (
      !detailsPath.test(url) ||
      !documentUrl ||
      !statusPath.test(documentUrl)
    ) {
      return
    }

    const filter = browser.webRequest.filterResponseData(requestId)
    const decoder = new TextDecoder('utf-8')
    const encoder = new TextEncoder()

    filter.ondata = (event) => {
      // TODO generate sourceUrl from event data here
      console.log(url)
      console.log(documentUrl)
      const str = decoder.decode(event.data, { stream: true })

      filter.write(encoder.encode(str))

      console.log(event)

      const tweet = JSON.parse(str)

      console.log(str)

      const media =
        tweet?.data?.threaded_conversation_with_injections_v2?.instructions?.[0]
          ?.entries?.[0]?.content?.itemContent?.tweet_results?.result?.legacy
          ?.extended_entities?.media?.[0]

      const videos = media?.video_info?.variants
      const thumbnail = media?.media_url_https
      const sourceUrl = tweet?.data?.threaded_conversation_with_injections_v2?.instructions?.[0]
          ?.entries?.[0]?.content?.itemContent?.tweet_results?

      if (!videos?.length) {
        return
      }

      const videoFoundMessage: VideosFoundMessage = {
        type: 'VIDEOS_FOUND',
        sourceUrl,
        thumbnail,
        media: videos
      }

      browser.runtime.sendMessage(undefined, videoFoundMessage)
    }

    filter.onstop = () => {
      filter.close()
    }
  },
  {
    urls: ['https://twitter.com/i/api/graphql/*'],
    types: ['xmlhttprequest', 'speculative', 'other']
  },
  ['blocking']
)
