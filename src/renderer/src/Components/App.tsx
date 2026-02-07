import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Connection from './Connection'
import Divider from '@mui/material/Divider'
import Bootloader from './Bootloader/Bootloader'
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'

const App = () => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      window.bootloader.uploadFile(acceptedFiles[0].path)
    }
  }, [])
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: { 'application/octet-stream': ['.hex'] },
    noClick: true
  })
  return (
    <Box sx={{ flexGrow: 1 }} height={1} {...getRootProps()}>
      <input {...getInputProps()} />
      <Grid container direction={'column'} height={1}>
        <Grid size={'auto'}>
          <Connection />
        </Grid>
        <Divider />
        <Grid size={'grow'} overflow={'hidden'}>
          <Bootloader />
        </Grid>
      </Grid>
    </Box>
  )
}

export default App
