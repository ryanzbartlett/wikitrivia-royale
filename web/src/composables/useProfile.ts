import { StorageSerializers, useStorage } from '@vueuse/core';
import type { Profile } from '../../../shared/types.ts';

export function useProfile() {
  const profile = useStorage<Profile>('wtroyale:profile', null, localStorage, { serializer: StorageSerializers.object });

  function setProfile(p: Profile): void {
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
