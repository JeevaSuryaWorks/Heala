import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Get extra user details (like role and name) from the profiles table
    const fetchUserProfile = async (authUser) => {
        try {
            const adminEmails = [
                'gobika@heala.com',
                'karthika@heala.com',
                'mathumitha@heala.com',
                'manju@heala.com',
                'js@heala.com'
            ];

            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) throw error;

            // Auto-promote specified emails to admin
            if (adminEmails.includes(authUser.email.toLowerCase()) && profile.role !== 'admin') {
                const { data: updatedProfile, error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', authUser.id)
                    .select()
                    .single();
                
                if (!updateError) {
                    profile = updatedProfile;
                }
            }
            
            console.log('Fetched profile:', profile);

            // Try to fetch doctor-specific details in case the user has a doctor profile
            // This happens if an admin is also a registered doctor, or if the role was auto-promoted but they still act as an expert
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('*, verification_status')
                .eq('profile_id', authUser.id)
                .single();
            
            if (doctorData) {
                console.log('Fetched doctor data:', doctorData);
                profile = { ...profile, doctorData };
            } else if (doctorError && doctorError.code !== 'PGRST116') {
                // If the error isn't "row not found", log it
                console.warn('Error checking doctor profile:', doctorError.message);
            }
            
            setUser({ ...authUser, ...profile });
            console.log('Final user state:', { ...authUser, ...profile });
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
            setUser(authUser);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) return { success: false, message: error.message };
            
            // `onAuthStateChange` will handle fetching the profile and setting state
            return { success: true };
        } catch (error) {
            return { success: false, message: 'An unexpected error occurred' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const { email, password, name, phone, role = 'patient', ...doctorData } = userData;
            
            // 1. Sign up the user in Supabase Auth with metadata for the trigger
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role,
                        phone // Include phone in metadata too for the trigger if needed, or update later
                    }
                }
            });
            
            if (authError) return { success: false, message: authError.message };

            // 2. The database trigger 'handle_new_user' automatically creates the profile.
            if (authData?.user && role === 'doctor') {
                const { error: doctorError } = await supabase
                    .from('doctors')
                    .insert([{
                        profile_id: authData.user.id,
                        specialization: doctorData.specialization || 'General',
                        qualification: doctorData.qualification || '',
                        experience: doctorData.experience || '0',
                        fee: parseInt(doctorData.fee) || 0,
                        license_number: doctorData.licenseNumber || '',
                        clinic_name: doctorData.clinicName || '',
                        clinic_address: doctorData.clinicAddress || '',
                        available_days: doctorData.availableDays || [],
                        available_time: {
                            start: doctorData.availableTimeStart || '09:00',
                            end: doctorData.availableTimeEnd || '17:00'
                        },
                        verification_status: 'pending'
                    }]);

                if (doctorError) {
                    console.error("Doctor profile creation error:", doctorError);
                    return { success: false, message: 'Account created but doctor profile failed: ' + doctorError.message };
                }
            }

            return { success: true, needsConfirmation: !authData.session };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'An unexpected error occurred during registration' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Error signing out:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
