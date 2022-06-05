import 'emoji-log'
import { browser, WebRequest } from 'webextension-polyfill-ts'

const listener = (details: WebRequest.OnBeforeRequestDetailsType) => {
  const detailsPath =
    /^https:\/\/twitter.com\/i\/api\/graphql\/[0-9a-z_]*\/TweetDetail\?/gi

  if (!detailsPath.test(details.url)) {
    return
  }

  console.log(details)

  const filter = browser.webRequest.filterResponseData(details.requestId)
  const decoder = new TextDecoder('utf-8')
  const encoder = new TextEncoder()

  filter.ondata = (event) => {
    const str = decoder.decode(event.data, { stream: true })

    filter.write(encoder.encode(str))
    filter.disconnect()

    const tweet = JSON.parse(str)

    const media =
      tweet?.data?.threaded_conversation_with_injections_v2?.instructions?.[0]
        ?.entries?.[0]?.content?.itemContent?.tweet_results?.result?.legacy
        ?.extended_entities?.media?.[0]

    if (!media) {
      return
    }

    console.log(media?.video_info?.variants)
  }
}

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed')
})

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://twitter.com/i/api/graphql/*'],
    types: ['xmlhttprequest']
  },
  ['blocking']
)
