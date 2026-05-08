import { Text as RNText, TextProps, StyleSheet } from 'react-native'

const WEIGHT_MAP: Record<string, string> = {
  '400': 'DMSans_400Regular',
  '500': 'DMSans_500Medium',
  '600': 'DMSans_600SemiBold',
  '700': 'DMSans_700Bold',
  normal: 'DMSans_400Regular',
  bold:   'DMSans_700Bold',
}

export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {}
  const weight = String(flat.fontWeight ?? '400')
  const family = WEIGHT_MAP[weight] ?? 'DMSans_400Regular'

  return (
    <RNText
      style={[{ fontFamily: family }, style]}
      {...props}
    />
  )
}
