import React from 'react'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  showText?: boolean
  size?: number
}

export default function Icon(props: Props) {
  const { loading: loadingFromProps, priority: priorityFromProps, className, showText = false, size = 40 } = props

  const loading = loadingFromProps || 'lazy'
  const isPriority = priorityFromProps === 'high'

  return (
    <span>
      <div className="flex aspect-square h-full items-center justify-center rounded-lg transition-all">
        <Image
          src="/hmm-vstock/logo.png"
          alt="Logo"
          width={196}
          height={196}
          className="h-full w-full object-contain"
        />
      </div>
    </span>
  )
}
