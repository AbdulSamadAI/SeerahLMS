import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    profile: any | null;
    currentClass: number;
    setProfile: (profile: any) => void;
    setCurrentClass: (classNumber: number) => void;
    clear: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            profile: null,
            currentClass: 1,
            setProfile: (profile) => set({ profile }),
            setCurrentClass: (currentClass) => set({ currentClass }),
            clear: () => set({ profile: null, currentClass: 1 }),
        }),
        {
            name: 'user-storage',
        }
    )
);
