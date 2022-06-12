import { browser, WebRequest } from 'webextension-polyfill-ts'
import { VideosFoundMessage } from '../types'

interface OnDataArgs {
  filter: WebRequest.StreamFilter
  decoder: TextDecoder
  encoder: TextEncoder
  tabId: number
}

const onData =
  ({ filter, decoder, encoder, tabId }: OnDataArgs) =>
  (event: WebRequest.StreamFilterEventData) => {
    const str = decoder.decode(event.data, { stream: true })

    filter.write(encoder.encode(str))

    const tweet = JSON.parse(str)

    const result =
      tweet?.data?.threaded_conversation_with_injections_v2?.instructions?.[0]
        ?.entries?.[0]?.content?.itemContent?.tweet_results?.result

    const tweetId = result?.rest_id

    const screenName = result?.core?.user_results?.result?.legacy?.screen_name

    const media = result?.legacy?.extended_entities?.media?.[0]
    const videos = media?.video_info?.variants
    const thumbnail = media?.media_url_https

    if (!videos?.length) {
      return
    }

    const videoFoundMessage: VideosFoundMessage = {
      type: 'VIDEOS_FOUND',
      sourceUrl: `https://twitter.com/${screenName}/status/${tweetId}`,
      thumbnail,
      media: videos
    }

    console.log(videoFoundMessage)

    // browser.runtime.sendMessage(undefined, videoFoundMessage)

    // TODO
    // Persist urls which can be archived
    // Toggle based on urls
    console.log('Show in ', tabId)
    browser.pageAction.show(tabId)
  }

const onBeforeRequest = ({
  url,
  documentUrl,
  requestId,
  tabId
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

  filter.ondata = onData({ filter, decoder, encoder, tabId })

  filter.onerror = () => {}

  filter.onstop = () => {
    filter.close()
  }
}

if (browser.webRequest.onBeforeRequest.hasListener(onBeforeRequest)) {
  browser.webRequest.onBeforeRequest.removeListener(onBeforeRequest)
}

browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  {
    urls: ['https://twitter.com/i/api/graphql/*'],
    types: ['xmlhttprequest']
  },
  ['blocking']
)

browser.tabs.onUpdated.addListener((tabId) => {
  // TODO Hide can be called after show
  console.log('Hide in ', tabId)
  browser.pageAction.hide(tabId)
})
