import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import LinearProgress, {
  LinearProgressProps,
  linearProgressClasses
} from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800]
    })
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5
  }
}))

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', margin: '10px 20px 0 15px' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <BorderLinearProgress variant="determinate" color={'success'} {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="h6"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  )
}

const ProgressBar = () => {
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [status, setStatus] = useState('unknown')

  useEffect(() => {
    const unsubList = [
      window.ipc.subscribe('updateProgress', (newProgress) => setProgress(newProgress)),
      window.ipc.subscribe('updateStatus', (newStatus) => setStatus(newStatus))
    ]
    return () => {
      unsubList.forEach((unsub) => unsub())
    }
  }, [])

  useEffect(() => {
    console.log(`${progress.current}/${progress.total}`)
  }, [progress])

  const runProgram = useCallback(() => {
    window.bootloader.runProgram()
  }, [])

  return (
    <Box height={40} width={1}>
      {status === 'progress' && (
        <LinearProgressWithLabel
          value={progress.total ? Math.floor((100 * progress.current) / progress.total) : 0}
        />
      )}
      {status !== 'progress' && (
        <Button
          {...{
            variant: 'contained',
            sx: { width: 460, margin: '0 0 5px 15px' },
            size: 'large',
            color: 'success',
            disabled: status !== 'finish'
            // onClick: runProgram
          }}
        >
          Ready
        </Button>
      )}
    </Box>
  )
}

export default ProgressBar
