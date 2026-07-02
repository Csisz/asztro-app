import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  clearProfile as clearStoredProfile,
  loadProfile,
  saveProfile as persistProfile,
  type Profile,
} from '@/lib/profile';

interface ProfileContextValue {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile()
      .then(setProfileState)
      .finally(() => setIsLoading(false));
  }, []);

  const setProfile = useCallback(async (next: Profile) => {
    await persistProfile(next);
    setProfileState(next);
  }, []);

  const clearProfile = useCallback(async () => {
    await clearStoredProfile();
    setProfileState(null);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, isLoading, setProfile, clearProfile }),
    [profile, isLoading, setProfile, clearProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
