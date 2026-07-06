import { Text, TextInput } from 'react-native';
import { appFontFamily } from './index';

const lockedTextStyle = {
  fontFamily: appFontFamily,
  fontStyle: 'normal' as const,
  letterSpacing: 0,
};

function mergeDefaultStyle(component: typeof Text | typeof TextInput) {
  const target = component as typeof component & {
    defaultProps?: { style?: unknown };
  };

  target.defaultProps = target.defaultProps ?? {};
  target.defaultProps.style = Array.isArray(target.defaultProps.style)
    ? [...target.defaultProps.style, lockedTextStyle]
    : [target.defaultProps.style, lockedTextStyle].filter(Boolean);
}

export function lockAppTypography() {
  mergeDefaultStyle(Text);
  mergeDefaultStyle(TextInput);
}
