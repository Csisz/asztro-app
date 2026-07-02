import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  name: string;
  /** ISO 8601 date string (YYYY-MM-DD), stored as plain data for AsyncStorage. */
  birthDate: string;
}

const STORAGE_KEY = 'asztro-app/profile';

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as Profile;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
