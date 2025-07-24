// Firebase Authentication Hook
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseAuthService, UserProfileData } from '../services/firebaseAuthService';

interface AuthState {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: false, // Start with false to prevent infinite loading
    error: null
  });

  useEffect(() => {
    // Set loading to true when starting auth state listener
    setAuthState(prev => ({ ...prev, loading: true }));
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is signed in, get their profile
          let profile = null;
          try {
            profile = await FirebaseAuthService.getUserProfile(user.uid);
          } catch (profileError) {
            console.warn('Could not load user profile:', profileError);
            // Create a basic profile if Firestore is not available
            profile = {
              uid: user.uid,
              email: user.email || '',
              firstName: user.displayName?.split(' ')[0] || 'User',
              lastName: user.displayName?.split(' ')[1] || '',
              profession: 'Student',
              emailVerified: user.emailVerified,
              createdAt: new Date(),
              role: 'student' as const
            };
          }
          
          setAuthState({
            user,
            profile,
            loading: false,
            error: null
          });
        } else {
          // User is signed out
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: null // Don't show auth errors on initial load
        }));
      }
    });

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setAuthState(prev => {
        if (prev.loading) {
          console.warn('Auth state loading timeout, proceeding without authentication');
          return {
            user: null,
            profile: null,
            loading: false,
            error: null
          };
        }
        return prev;
      });
    }, 5000); // 5 second timeout
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profession: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await FirebaseAuthService.registerUser(userData);
      
      // The auth state will be updated automatically by onAuthStateChanged
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await FirebaseAuthService.signInUser(email, password);
      
      // The auth state will be updated automatically by onAuthStateChanged
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await FirebaseAuthService.signOut();
      // The auth state will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      return await FirebaseAuthService.resendEmailVerification();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      return await FirebaseAuthService.sendPasswordReset(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const verifyEmail = async (actionCode: string) => {
    try {
      const result = await FirebaseAuthService.verifyEmail(actionCode);
      
      // Reload auth state to get updated verification status
      if (result.user) {
        const profile = await FirebaseAuthService.getUserProfile(result.user.uid);
        setAuthState(prev => ({
          ...prev,
          user: result.user!,
          profile
        }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    isEmailVerified: authState.user?.emailVerified || false,
    signUp,
    signIn,
    signOut,
    resendVerification,
    sendPasswordReset,
    verifyEmail,
    clearError
  };
};