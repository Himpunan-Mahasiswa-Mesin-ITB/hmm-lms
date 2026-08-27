import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import React from 'react'

import RichText from '~/components/RichText'

import { Width } from '../Width'

export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  )
}
