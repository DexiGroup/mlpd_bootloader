// import TextField from '@mui/material/TextField'
import { useCallback } from 'react'
// import { styled } from '@mui/material/styles'
import Input from '@mui/material/Input'

// const StyledTextField = styled(TextField)({
//   width: '100%',
//   height: '100%'
//   // '& .'
// })

const InputField = ({ value, name, setDescription, ...rest }) => {
  const onChange = useCallback((event) => {
    setDescription((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }, [])
  return (
    <Input
      {...rest}
      value={value}
      name={name}
      size={'small'}
      disableUnderline={true}
      fullWidth={true}
      margin={'none'}
      sx={{ height: '18px' }}
      // variant="standard"
      onChange={onChange}
    />
  )
}

export default InputField
