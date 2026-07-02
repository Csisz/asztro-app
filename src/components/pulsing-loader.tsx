import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface PulsingLoaderProps {
  symbol?: string;
  label?: string;
}

export function PulsingLoader({ symbol = '🔮', label }: PulsingLoaderProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.25, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={styles.container}>
      <Animated.Text style={[styles.symbol, animatedStyle]}>{symbol}</Animated.Text>
      {label && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  symbol: {
    fontSize: 32,
  },
  label: {
    textAlign: 'center',
  },
});
