import { StorageSerializers, useStorage } from '@vueuse/core';

interface UserProfile {
  id: string;
  name: string;
}

export function useProfile() {
  const profile = useStorage<UserProfile>('wtroyale:profile', null, localStorage, { serializer: StorageSerializers.object });

  function setProfile(p: UserProfile): void {
    profile.value = p;
  }

  function unsetProfile() {
    profile.value = null;
  }

  return {
    profile,
    setProfile,
    unsetProfile,
  };
}
