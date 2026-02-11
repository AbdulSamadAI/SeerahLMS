import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsSessionLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsSessionLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch user profile from users_extended
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['user-profile', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users_extended')
                .select('*')
                .eq('id', user?.id)
                .single();
            // Handle case where profile doesn't exist yet (e.g. new signup)
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        }
    });

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const combinedLoading = isSessionLoading || (!!user && isProfileLoading);

    return (
        <AuthContext.Provider value={{ user, session, profile, isLoading: combinedLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
