import type { NextConfig } from "next";
import { withTamagui } from '@tamagui/next-plugin'

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: ['tamagui', '@tamagui/core', '@tamagui/config'],
};

const tamaguiPlugin = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
})

const config: NextConfig = {
  ...nextConfig,
  ...tamaguiPlugin(nextConfig),
}

export default config;
