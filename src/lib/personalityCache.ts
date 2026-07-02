import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile } from './profile';

const STORAGE_KEY_PREFIX = 'asztro-app/personality/';

function cacheKey(profile: Profile): string {
  return `${STORAGE_KEY_PREFIX}${profile.name}|${profile.birthDate}`;
}

export async function loadCachedPersonality(profile: Profile): Promise<string | null> {
  return AsyncStorage.getItem(cacheKey(profile));
}

export async function savePersonalityCache(profile: Profile, text: string): Promise<void> {
  await AsyncStorage.setItem(cacheKey(profile), text);
}
