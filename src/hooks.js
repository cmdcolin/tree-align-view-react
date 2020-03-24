import { useCallback, useState, useLayoutEffect } from 'react'

export const useRaf = (arg, ms = 1e12, delay = 0) => {
  const [elapsed, set] = useState(0)

  useLayoutEffect(() => {
    let raf
    let timerStop
    let start

    const onFrame = () => {
      const time = Math.min(1, (Date.now() - start) / ms)
      set(time)
      loop()
    }
    const loop = () => {
      raf = requestAnimationFrame(onFrame)
    }
    const onStart = () => {
      timerStop = setTimeout(() => {
        cancelAnimationFrame(raf)
        set(1)
      }, ms)
      start = Date.now()
      loop()
    }
    const timerDelay = setTimeout(onStart, delay)

    return () => {
      clearTimeout(timerStop)
      clearTimeout(timerDelay)
      cancelAnimationFrame(raf)
    }
  }, [arg, delay, ms])

  return elapsed
}

export const useTween = (arg, ms = 1000, delay = 0) => {
  const fn = t => t
  const t = useRaf(arg, ms, delay)
  return fn(t)
}

const incrementParameter = (num: number): number => ++num % 1_000_000

export const useUpdate = () => {
  const [, setState] = useState(0)
  // useCallback with empty deps as we only want to define updateCb once
  return useCallback(() => setState(incrementParameter), [])
}
