import { useState } from 'react'
import ProgressBar from './ProgressBar'
import InfoTable from './InfoTable'
import Commands from './Commands'

export const FIELDS = [
  { name: 'fileName', label: 'File name', defaultValue: '' },
  { name: 'filePath', label: 'File path', defaultValue: '' },
  { name: 'fileSize', label: 'File size', defaultValue: '' },
  { name: 'rowCount', label: 'Row count', defaultValue: '' },
  // { name: 'projectName', label: 'Project name', defaultValue: '' },
  { name: 'gateId', label: 'Gate ID', defaultValue: '', editable: true },
  { name: 'groupName', label: 'Group name', defaultValue: 'all', editable: true },
  { name: 'deviceName', label: 'Device name', defaultValue: 'all', editable: true },
  // { name: 'version', label: 'Version', defaultValue: '', editable: true },
  { name: 'repeatCount', label: 'Repeat number', defaultValue: 3, editable: true },
  { name: 'sendInterval', label: 'Send interval', defaultValue: 200, editable: true },
  { name: 'verticalSending', defaultValue: true, hidden: true }
  // { name: 'verticalSending', label: 'verticalSending', defaultValue: true, editable: false , hidden: true },
  // {name: 'repeatInterval', label: 'Repeat interval(ms)', defaultValue: 200 },
]

const Bootloader = () => {
  const [description, setDescription] = useState(
    Object.fromEntries(FIELDS.map((desc) => [desc.name, desc.defaultValue]))
  )

  return (
    <>
      <InfoTable {...{ description, setDescription, FIELDS }} />
      <Commands {...{ description }} />
      <ProgressBar />
    </>
  )
}

export default Bootloader
