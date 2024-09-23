import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector
} from '@mui/x-data-grid-premium'

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  )
}

export default CustomToolbar
