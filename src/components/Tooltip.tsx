import { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ children, text, position = 'top' }: TooltipProps) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  }

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positions[position]} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none`}>
        <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
          {text}
          <div className={`absolute ${arrows[position]} w-0 h-0 border-4 border-transparent`}></div>
        </div>
      </div>
    </div>
  )
}
