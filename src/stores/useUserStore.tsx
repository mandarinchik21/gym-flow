import { create } from 'zustand';

interface UserState {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
    setIsLoggedIn: (isLoggedIn) => set({isLoggedIn}),
    isLoggedIn: false,
    isAdmin: false,
    setIsAdmin: (isAdmin) => set({isAdmin}),
}));
