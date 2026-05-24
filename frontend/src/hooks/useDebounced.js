import { useEffect, useState } from 'react'

const useDebounced = (value, timeout = 400) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, timeout)

    return () => clearTimeout(timer)
  }, [value, timeout])

  return debounced
}

export default useDebounced