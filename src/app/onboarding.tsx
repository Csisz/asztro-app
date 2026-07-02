import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { hu } from '@/i18n/hu';

const MIN_BIRTH_DATE = new Date(1925, 0, 1);
const DEFAULT_BIRTH_DATE = new Date(1995, 0, 1);

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function OnboardingScreen() {
  const { setProfile } = useProfile();
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

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
    void setProfile({ name: trimmedName, birthDate: toIsoDate(birthDate) });
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
          {hu.onboarding.heading}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.intro}>
          {hu.onboarding.intro}
        </ThemedText>

        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">{hu.onboarding.nameLabel}</ThemedText>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError(false);
            }}
            placeholder={hu.onboarding.namePlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          {nameError && (
            <ThemedText type="small" style={styles.errorText}>
              {hu.onboarding.nameRequiredError}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">{hu.onboarding.birthDateLabel}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {hu.onboarding.birthDateHint}
          </ThemedText>

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
              {hu.onboarding.submitButton}
            </ThemedText>
          </ThemedView>
        </Pressable>
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
    paddingTop: Spacing.six,
    gap: Spacing.five,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
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
    marginTop: 'auto',
    marginBottom: Spacing.four,
  },
  submitButtonText: {
    color: '#241A45',
  },
  pressed: {
    opacity: 0.7,
  },
});
