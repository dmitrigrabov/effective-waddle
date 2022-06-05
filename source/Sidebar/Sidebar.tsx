import React, { FC } from 'react'
import { browser, Tabs } from 'webextension-polyfill-ts'

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({ url })
}

const Sidebar: FC = () => {
  console.log(openWebPage)

  return <div>Sidebar content will go here</div>
}

export default Sidebar
