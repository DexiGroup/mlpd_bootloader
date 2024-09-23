import Autocomplete from '@mui/material/Autocomplete'
// import SettingsInput from '../SettingsInput'
import { useCallback, useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'

const GateField = ({ value, setDescription }) => {
  // const options = ['123', '435']
  const [gateList, setGateList] = useState([])

  useEffect(() => {
    const unsubList = [window.ipc.subscribe('updateGateList', setGateList)]
    return () => {
      unsubList.forEach((unsub) => unsub())
    }
  }, [])

  // console.log(gateList)

  const onChange = useCallback((newValue: any) => {
    console.log('onChange', newValue)
    setDescription((prev) => ({ ...prev, gateId: newValue }))
  }, [])

  return (
    <Autocomplete
      sx={{ width: '235px', display: 'inline-flex' }}
      value={value ?? ''}
      options={gateList}
      onChange={onChange}
      freeSolo={true}
      renderInput={(params) => <TextField {...{ ...params, name: 'host', size: 'small' }} />}
    />
  )
}

export default GateField
