import { Text, TextProps, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

type AppTextProps = TextProps & {
  variant?: 'body' | 'caption' | 'title' | 'heading' | 'amount';
  color?: string;
  style?: TextStyle;
};

export function AppText({ variant = 'body', color = colors.ink, style, ...props }: AppTextProps) {
  return <Text {...props} style={[styles[variant], { color }, style]} />;
}

const styles = {
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18, color: colors.muted },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  amount: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
};
