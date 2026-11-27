import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export function LayoutReveal({ children, sizeKey }: { children: ReactNode; sizeKey: string }) {
  const regionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const updateSize = useRef<() => void>(null)

  useLayoutEffect(() => {
    const region = regionRef.current
    const content = contentRef.current
    if (!region || !content || typeof ResizeObserver === 'undefined' || !region.animate) return

    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let { height, width } = content.getBoundingClientRect()
    let animation: Animation | undefined
    // Preserve the scroll range while React replaces the panel contents.
    region.style.blockSize = `${height}px`

    const stop = () => {
      if (animation) {
        animation.onfinish = null
        animation.cancel()
        animation = undefined
      }
      region.removeAttribute('data-resizing')
    }

    const measure = () => {
      const { height: nextHeight, width: nextWidth } = content.getBoundingClientRect()
      const widthChanged = nextWidth !== width
      if (nextHeight === height && !widthChanged) return

      // A second selection starts from the visible height of the previous animation.
      const from = animation ? region.getBoundingClientRect().height : height
      width = nextWidth
      height = nextHeight

      stop()
      region.style.blockSize = `${height}px`
      if (!motion.matches || widthChanged || region.matches(':focus-within') || Math.abs(from - height) <= .5) return

      region.setAttribute('data-resizing', '')
      animation = region.animate(
        [{ blockSize: `${from}px` }, { blockSize: `${height}px` }],
        { duration: 280, easing: 'cubic-bezier(.3, 0, .2, 1)', fill: 'both' },
      )
      animation.onfinish = stop
    }

    const observer = new ResizeObserver(measure)
    updateSize.current = measure
    observer.observe(content)
    motion.addEventListener('change', stop)
    region.addEventListener('focusin', stop)
    return () => {
      updateSize.current = null
      observer.disconnect()
      motion.removeEventListener('change', stop)
      region.removeEventListener('focusin', stop)
      stop()
      region.style.removeProperty('block-size')
    }
  }, [])

  // Start layout changes in the React commit, before the browser can paint the new height.
  useLayoutEffect(() => updateSize.current?.(), [sizeKey])

  return (
    <div className="layout-reveal" ref={regionRef}>
      <div className="layout-reveal-content" ref={contentRef}>{children}</div>
    </div>
  )
}
