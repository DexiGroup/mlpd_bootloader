import Autocomplete from '@mui/material/Autocomplete'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import SettingsInput from './SettingsInput'

type Form = {
  host?: string
  port?: string
  username?: string
  password?: string
  projectName?: string
}

const Connection = () => {
  const options = ['188.225.81.229', '46.39.226.183', '127.0.0.1']
  // const wellknown_projects = ['d2_test', 'd2mesh']
  const [form, setForm] = useState<Form>({})
  const [mqttConnection, setConnection] = useState<boolean>(false)

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (mqttConnection) {
        await window.mqtt.disconnect()
        setConnection(false)
      } else {
        await window.mqtt.connect(form)
        setConnection(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const onChange = (_event: any, newValue: string | null) => {
    setForm({ ...form, host: newValue ?? '' })
  }

  const inputProps = { form, setForm }

  return (
    <Box sx={{ padding: '10px' }} component="form" onSubmit={submit}>
      <Autocomplete
        sx={{ width: '235px', display: 'inline-flex' }}
        value={form.host ?? ''}
        options={options}
        onChange={onChange}
        freeSolo={true}
        renderInput={(params) => (
          <SettingsInput {...{ ...inputProps, ...params, name: 'host', size: 'small' }} />
        )}
      />
      <SettingsInput {...{ ...inputProps, name: 'port', required: false }} />
      <SettingsInput {...{ ...inputProps, name: 'username', required: false }} />
      <SettingsInput {...{ ...inputProps, name: 'password', required: false, type: 'password' }} />
      <SettingsInput
        {...{
          ...inputProps,
          name: 'projectName',
          label: 'Project',
          size: 'small',
          type: 'Project'
        }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{ width: 225, margin: '5px' }}
        size={'large'}
        color={!mqttConnection ? 'primary' : 'error'}
      >
        {!mqttConnection ? 'Connect' : 'Disconnect'}
      </Button>
      {/*<Button onClick={submit}>Submit</Button>*/}
    </Box>
  )
}

export default Connection
