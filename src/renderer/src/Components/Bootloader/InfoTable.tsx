import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Tooltip from '@mui/material/Tooltip'
import { useEffect } from 'react'
import InputField from './InputField'
import Switch from '@mui/material/Switch'
// import SettingsInput from '../SettingsInput'
// import Autocomplete from '@mui/material/Autocomplete'
// import GateField from './GateField'
// import './license'
// import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium'
// import HeightBox from './HeightBox'
//
// const columns: GridColDef[] = [
//   { field: 'label', width: 150 },
//   { field: 'value', width: 150 }
// ]

// function getDefaultChecked(arr: any[], name: string) {
//   console.log(arr)
//   return arr?.find((a) => a.name === name)?.defaultValue ?? false
// }

const InfoTable = ({ description, setDescription, FIELDS }) => {
  // const [gateList, setGateList] = useState([])
  // const [checked, setChecked] = useState({ verticalSending: false, individual: false })

  useEffect(() => {
    const update = (newDescription) => {
      // console.log(newDescription)
      // console.log(newDescription.allData.map((a) => a.toString(16).padStart(2, '0')).join(' '))
      setDescription((prev) => ({ ...prev, ...newDescription }))
    }
    const unsubList = [
      window.ipc.subscribe('uploadedFile', update)
      // window.ipc.subscribe('updateGateList', setGateList)
    ]
    return () => {
      unsubList.forEach((unsub) => unsub())
    }
  }, [])

  // useEffect(() => {
  // }, [description])

  const rows = FIELDS.filter((desc) => !desc.hidden).map((desc, index) => ({
    id: index,
    label: desc.label,
    value: description[desc.name],
    suffix: desc.suffix,
    editable: desc.editable,
    name: desc.name
  }))

  // const onChange = (_event: any, newValue: string | null) => {
  //   setDescription((prev) => ({ ...prev, gateID: newValue ?? '' }))
  // }
  console.log(description)
  return (
    <TableContainer>
      <Table sx={{ width: 1 }} size="small">
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell align="left" width={150}>
                {row.label}
              </TableCell>

              <TableCell align="left">
                {row.editable ? (
                  <InputField
                    {...{
                      value: row.value,
                      name: row.name,
                      setDescription
                    }}
                  />
                ) : row.value.toString().length < 30 ? (
                  row.value
                ) : (
                  <Tooltip title={row.value}>
                    <span>{row.value.toString().substring(0, 30) + '...'}</span>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell align="left" width={150}>
              Vertical sending
            </TableCell>
            <TableCell align="left">
              <Switch
                value={description?.verticalSending ?? false}
                // defaultChecked={false}
                size="small"
                onChange={(_event, checked) => {
                  setDescription((prev) => ({ ...prev, verticalSending: checked }))
                }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" width={150}>
              Individual upload
            </TableCell>
            <TableCell align="left">
              <Switch
                size="small"
                value={description?.individual ?? false}
                // defaultChecked={getDefaultChecked(description, 'individual')}
                onChange={(_event, checked) => {
                  setDescription((prev) => ({ ...prev, individual: checked }))
                }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default InfoTable
