import React from 'react'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  showText?: boolean
  size?: number
}

export default function Logo(props: Props) {
  const { loading: loadingFromProps, priority: priorityFromProps, className, showText = false, size = 40 } = props

  const loading = loadingFromProps || 'lazy'
  const isPriority = priorityFromProps === 'high'

  return (
    <div className="text-sidebar-accent-foreground rounded-xl border border-transparent px-2 flex items-center">
      <div className="flex aspect-square h-full items-center justify-center rounded-lg transition-all">
        <Image
          src="/hmm-vstock/logo.png"
          alt="Logo"
          width={180}
          height={180}
          className="h-full w-full object-contain"
        />
      </div>
      {/*<div className="ml-2 flex-1 text-left leading-tight">
        <h1 className="truncate text-base font-semibold tracking-tight">HMM ITB</h1>
      </div>*/}
    </div>
  )
}
