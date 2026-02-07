import TextField from '@mui/material/TextField'

type Props = {
  name: string
  label?: string
  required?: boolean
  form: any
  setForm
}

const SettingsInput = (props: Props) => {
  const { name, label, form, setForm, ...rest } = props

  const onChange = (event: any) => {
    setForm({ ...form, [name]: event.target.value })
  }

  const labelString = label ?? name.charAt(0).toUpperCase() + name.slice(1)
  return (
    <TextField
      value={form[name] ?? ''}
      label={labelString}
      onChange={onChange}
      name={name}
      required
      // required={false}
      size="small"
      sx={{ width: 225, margin: '5px' }}
      {...rest}
    />
  )
}

export default SettingsInput
