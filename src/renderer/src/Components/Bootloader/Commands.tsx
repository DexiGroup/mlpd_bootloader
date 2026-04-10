import { useCallback, useEffect, useState } from 'react'
import Button, { ButtonOwnProps } from '@mui/material/Button'
// import FileUploadIcon from '@mui/icons-material/FileUpload'
// import FileUploadIcon from '@mui/icons-material/FileUpload'
// import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const Commands = ({ description }) => {
  const [status, setStatus] = useState('unknown')

  useEffect(() => {
    const update = (newStatus) => {
      setStatus(newStatus)
    }
    const unsub = window.ipc.subscribe('updateStatus', update)
    return () => {
      unsub()
    }
  }, [])

  const onUploadFile = useCallback((event) => {
    if (event.target.files[0]) {
      window.bootloader.uploadFile(event.target.files[0].path)
    }
  }, [])

  const abortProgram = useCallback(() => {
    window.bootloader.abortProgram()
  }, [])

  const {
    gateId,
    repeatCount,
    sendInterval,
    projectName,
    version,
    groupName,
    deviceName,
    verticalSending
  } = description

  const params = {
    gateId,
    repeatCount,
    sendInterval,
    projectName,
    version,
    groupName,
    deviceName,
    verticalSending
  }

  const beginProgram = async () => {
    try {
      await window.bootloader.beginProgram(params)
    } catch (error) {
      console.log(error)
    }
  }

  const commonProps = {
    variant: 'contained',
    sx: { width: 225, margin: '5px' },
    size: 'large'
  } as ButtonOwnProps

  const getButtonByStatus = (status: string) => {
    let params: any = {
      label: 'Send program',
      action: beginProgram
    }
    // if (status === 'ready') {
    //   params = {
    //     label: 'Program',
    //     action: beginProgram
    //   }
    // }
    if (status === 'progress') {
      params = {
        label: 'Abort',
        action: abortProgram,
        color: 'error'
      }
    }
    return (
      <Button
        {...{
          ...commonProps,
          onClick: params.action,
          color: params.color
          // disabled: params.disabled
        }}
      >
        {params.label}
      </Button>
    )
  }

  return (
    <Box sx={{ padding: '10px' }}>
      <Button {...{ ...commonProps, component: 'label', role: undefined }}>
        Upload file
        <VisuallyHiddenInput type="file" accept=".hex" onChange={onUploadFile} />
      </Button>
      {getButtonByStatus(status)}
      {/*<Button {...{ ...commonProps, onClick: beginProgram }}>Program</Button>*/}
      {/*<Button onClick={abortProgram}>Abort</Button>*/}
      {/*<Button onClick={runProgram}>Run</Button>*/}
    </Box>
  )
}

export default Commands
