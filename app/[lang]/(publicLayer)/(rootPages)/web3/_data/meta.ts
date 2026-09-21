import { getAppConfig } from '@/config/app-config'
import { getOgImagePath } from '@/config/app-config.defaults'

export const meta = {
  tags: ['WEB3'],
  subPath: '/web3',
  get ogImage(): string {
    return getOgImagePath(getAppConfig()) ?? ''
  },
}
