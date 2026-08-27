import React from 'react'

import { getCachedGlobal } from '~/utilities/getGlobals'

import { HeaderClient } from './Component.client'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData} />
}
