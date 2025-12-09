import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from '@tamagui/core'

const appConfig = createTamagui(defaultConfig)

export type AppConfig = typeof appConfig

declare module '@tamagui/core' {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig