import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PulsingLoader } from '@/components/pulsing-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { hu } from '@/i18n/hu';
import { getCompatibility, type CompatibilityResult } from '@/lib/compatibility';
import type { Profile } from '@/lib/profile';
import { aiService } from '@/services/ai';

const MIN_BIRTH_DATE = new Date(1925, 0, 1);
const DEFAULT_BIRTH_DATE = new Date(1995, 0, 1);

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MatchScreen() {
  const { profile } = useProfile();
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<CompatibilityResult | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState(false);

  useEffect(() => {
    if (!profile || !otherProfile) return;
    const result = getCompatibility(profile, otherProfile);
    setScores(result);
    setExplanation(null);
    setExplanationError(false);
    setIsLoadingExplanation(true);

    aiService
      .explainCompatibility(profile, otherProfile, result)
      .then(setExplanation)
      .catch(() => setExplanationError(true))
      .finally(() => setIsLoadingExplanation(false));
  }, [profile, otherProfile]);

  if (!profile) {
    return null;
  }

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(true);
      return;
    }
    setOtherProfile({ name: trimmedName, birthDate: toIsoDate(birthDate) });
  };

  const handleReset = () => {
    setOtherProfile(null);
    setScores(null);
    setExplanation(null);
    setExplanationError(false);
    setName('');
    setBirthDate(DEFAULT_BIRTH_DATE);
  };

  const formattedDate = birthDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.heading}>
          {hu.match.title}
        </ThemedText>

        {!otherProfile ? (
          <>
            <ThemedText themeColor="textSecondary">{hu.match.intro}</ThemedText>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">{hu.match.nameLabel}</ThemedText>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(false);
                }}
                placeholder={hu.match.namePlaceholder}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              {nameError && (
                <ThemedText type="small" style={styles.errorText}>
                  {hu.match.nameRequiredError}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">{hu.match.birthDateLabel}</ThemedText>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  minimumDate={MIN_BIRTH_DATE}
                  themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                  onChange={handleDateChange}
                />
              ) : (
                <>
                  <Pressable onPress={() => setShowAndroidPicker(true)}>
                    <ThemedView type="backgroundElement" style={styles.dateButton}>
                      <ThemedText>{formattedDate}</ThemedText>
                    </ThemedView>
                  </Pressable>
                  {showAndroidPicker && (
                    <DateTimePicker
                      value={birthDate}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      minimumDate={MIN_BIRTH_DATE}
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </ThemedView>

            <Pressable onPress={handleSubmit} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="primary" style={styles.submitButton}>
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  {hu.match.submitButton}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </>
        ) : (
          scores && (
            <>
              <ThemedView style={styles.scoreCircle}>
                <ThemedText type="title" style={styles.scoreNumber}>
                  {scores.overallScore}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  / 100
                </ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.subScoresCard}>
                <ThemedView style={styles.cardRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {hu.match.chineseScoreLabel}
                  </ThemedText>
                  <ThemedText type="smallBold">{scores.chineseScore}/100</ThemedText>
                </ThemedView>
                <ThemedView style={styles.cardRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {hu.match.westernScoreLabel}
                  </ThemedText>
                  <ThemedText type="smallBold">{scores.westernScore}/100</ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.explanationCard}>
                {isLoadingExplanation && !explanation ? (
                  <PulsingLoader label={hu.match.explanationLoading} />
                ) : explanationError && !explanation ? (
                  <ThemedText themeColor="textSecondary">{hu.match.explanationError}</ThemedText>
                ) : (
                  <ThemedText style={styles.explanationText}>{explanation}</ThemedText>
                )}
              </ThemedView>

              <Pressable onPress={handleReset} style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={styles.resetButton}>
                  <ThemedText type="link">{hu.match.backButton}</ThemedText>
                </ThemedView>
              </Pressable>
            </>
          )
        )}
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
    gap: Spacing.four,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  errorText: {
    color: '#E5484D',
  },
  dateButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#241A45',
  },
  scoreCircle: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#E5C158',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
  },
  subScoresCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  explanationCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  explanationText: {
    lineHeight: 22,
  },
  resetButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
