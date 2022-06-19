import { browser } from 'webextension-polyfill-ts'
import { Message } from '../types'

const listenForUrlChange = () => {
  let attempts = 100
  // eslint-disable-next-line no-undef
  // eslint-disable-next-line prefer-const
  let interval: NodeJS.Timeout

  const initialUrl = document.URL

  function checkUrl() {
    attempts -= 1

    if (attempts < 0) {
      clearInterval(interval)
    }

    if(document.URL !== )
  }

  interval = setInterval(checkUrl, 100)
}

const archiveUrl = (url: string) => {
  const urlInput = document.querySelector<HTMLInputElement>('#url')
  const archiveForm = document.querySelector<HTMLFormElement>('#submiturl')

  if (!urlInput) {
    return
  }

  urlInput.value = url

  console.log('Setting url: ', url)

  listenForUrlChange()

  archiveForm?.submit()
}

const messageListener = (message: Message) => {
  if (message.type !== 'ARCHIVE_URL') {
    return
  }

  console.log('Archive url: ', message.url)

  archiveUrl(message.url)
}

const init = async () => {
  const archiveServiceUrl = 'https://archive.ph/'

  if (!document.URL.startsWith(archiveServiceUrl)) {
    console.log('page is not archive')
    return
  }

  console.log('Initialise content script')

  browser.runtime.onMessage.addListener(messageListener)

  browser.runtime.sendMessage({ type: 'ARCHIVER_LOADED' })
}

init()
