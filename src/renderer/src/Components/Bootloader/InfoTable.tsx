import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { useEffect } from 'react'
import InputField from './InputField'
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

const InfoTable = ({ description, setDescription, FIELDS }) => {
  // const [gateList, setGateList] = useState([])

  useEffect(() => {
    const update = (newDescription) => {
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

  // console.log(gateList)

  const rows = FIELDS.map((desc, index) => ({
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
                ) : (
                  row.value
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default InfoTable
