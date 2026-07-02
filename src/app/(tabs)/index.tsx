import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/context/profile-context';
import { hu } from '@/i18n/hu';
import { getChineseSign } from '@/lib/chineseZodiac';
import { getWesternSign } from '@/lib/westernZodiac';

export default function ProfileScreen() {
  const { profile } = useProfile();

  if (!profile) {
    return null;
  }

  const birthDate = new Date(profile.birthDate);
  const westernSign = getWesternSign(birthDate);
  const chineseSign = getChineseSign(birthDate);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.greeting}>
            {hu.profile.greeting}, {profile.name}!
          </ThemedText>
          <ThemedText themeColor="textSecondary">{hu.profile.subtitle}</ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText style={styles.cardSymbol}>{westernSign.symbol}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {hu.profile.westernSignTitle}
          </ThemedText>
          <ThemedText type="subtitle" themeColor="primary">
            {westernSign.nameHu}
          </ThemedText>
          <ThemedView style={styles.cardRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {hu.profile.elementLabel}: {hu.westernElements[westernSign.element]}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {hu.profile.rulingPlanetLabel}: {westernSign.rulingPlanetHu}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText style={styles.cardSymbol}>{chineseSign.symbol}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {hu.profile.chineseSignTitle}
          </ThemedText>
          <ThemedText type="subtitle" themeColor="primary">
            {chineseSign.elementNameHu} {chineseSign.animalNameHu}
          </ThemedText>
          <ThemedView style={styles.cardRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {hu.profile.yinYangLabel}: {chineseSign.yinYangNameHu}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {hu.profile.lunarYearLabel}: {chineseSign.lunarYear}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 38,
  },
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  cardSymbol: {
    fontSize: 40,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
});
