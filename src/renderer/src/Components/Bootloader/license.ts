import { md5 } from '@mui/x-license-pro/encoding/md5'
import { LicenseInfo } from '@mui/x-license-pro'
import { LICENSE_SCOPES } from '@mui/x-license-pro/utils/licenseScope'
import { LICENSING_MODELS } from '@mui/x-license-pro/utils/licensingModel'

const orderNumber = ''
const expiryTimestamp = Date.now() // Expiry is based on when the package was created, ignored if perpetual license
const scope = LICENSE_SCOPES[1] // 'pro' or 'premium'
const licensingModel = LICENSING_MODELS[0] // 'perpetual', 'subscription'
const licenseInfo = `O=${orderNumber},E=${expiryTimestamp},S=${scope},LM=${licensingModel},KV=2`

LicenseInfo.setLicenseKey(md5(btoa(licenseInfo)) + btoa(licenseInfo))
