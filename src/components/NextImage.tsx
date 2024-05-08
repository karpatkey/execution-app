import Box from '@mui/material/Box'
import Image, { ImageProps } from 'next/image'
import { FC, useEffect, useState } from 'react'

export type NextImageProps = ImageProps & {
  margin?: string
}

const isImageValid = (src: any) => {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    img.onerror = () => resolve(false)
    img.onload = () => resolve(true)
    img.src = src
  })
}

const NextImage: FC<NextImageProps & { fallbackSrc: string }> = (props) => {
  const { src, fallbackSrc, width, height, margin, ...rest } = props
  const [imgSrc, setImgSrc] = useState<string>(src as string)

  useEffect(() => {
    // ts-ignore
    // eslint-disable-next-line no-void
    void (async () => {
      await isImageValid(src).then((isValid) => {
        setImgSrc(isValid ? (src as string) : fallbackSrc)
      })
    })()
  }, [fallbackSrc, src])

  return width ? (
    <Box
      sx={{
        width: width || undefined,
        height: height || undefined,
        position: 'relative',
        margin: margin || undefined,
      }}
    >
      <Image
        {...rest}
        layout="fill"
        data-testid="next-image"
        src={imgSrc}
        onError={() => {
          setImgSrc(fallbackSrc)
        }}
      />
    </Box>
  ) : (
    <Image
      {...rest}
      width={width}
      height={height}
      data-testid="next-image"
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}

export default NextImage
