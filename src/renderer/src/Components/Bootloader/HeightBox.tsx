import Box from '@mui/material/Box'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

type Props = {
  children: JSX.Element
}

const HeightBox = (props: Props) => {
  const [height, setHeight] = useState(0)
  const ref = useRef()

  const updateSize = useCallback(() => {
    const element = ref.current as unknown as HTMLDivElement
    const parent = element.parentNode as HTMLDivElement
    const parentHeight = parent.getBoundingClientRect().height
    const { childNodes } = parent
    let childrenHeight = 0
    for (let i = 0; i < childNodes.length; i++) {
      if (childNodes[i] !== element) {
        childrenHeight +=
          (childNodes[i] as HTMLDivElement)?.getBoundingClientRect()?.height ||
          0
      }
    }

    // console.log(parent.childNodes)
    // const height = window.innerHeight - element.getBoundingClientRect().top - 20
    const height = parentHeight - childrenHeight
    setHeight(height)
  }, [ref])

  useLayoutEffect(() => {
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  return (
    <Box width={1} height={height} ref={ref}>
      {props.children}
    </Box>
  )
}

export default HeightBox
