// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  ActionCodeSettings
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profession: string;
}

export interface UserProfileData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  profession: string;
  emailVerified: boolean;
  createdAt: any;
  lastLoginAt?: any;
  role: 'student' | 'tutor' | 'admin';
}

export class FirebaseAuthService {
  private static readonly VERIFICATION_URL = `${window.location.origin}/verify`;

  /**
   * Register a new user with email and password
   */
  static async registerUser(userData: UserRegistrationData): Promise<{ user: User; needsVerification: boolean }> {
    try {
      // Check if Firebase is properly configured
      if (!auth || typeof auth.createUserWithEmailAndPassword !== 'function') {
        throw new Error('Firebase Authentication is not properly configured');
      }
      
      // Create user with Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Try to create user document in Firestore (optional)
      try {
        const userProfile: UserProfileData = {
          uid: user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profession: userData.profession,
          emailVerified: false,
          createdAt: serverTimestamp(),
          role: 'student' // Default role
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      } catch (firestoreError) {
        console.warn('Could not save user profile to Firestore:', firestoreError);
        // Continue without Firestore - user is still created in Firebase Auth
      }

      // Try to send email verification
      try {
        const actionCodeSettings: ActionCodeSettings = {
          url: this.VERIFICATION_URL,
          handleCodeInApp: true
        };

        await sendEmailVerification(user, actionCodeSettings);
      } catch (emailError) {
        console.warn('Could not send verification email:', emailError);
        // Continue without email verification for demo
      }

      return {
        user,
        needsVerification: !user.emailVerified
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in user with email and password
   */
  static async signInUser(email: string, password: string): Promise<{ user: User; profile: UserProfileData }> {
    try {
      // Check if Firebase is properly configured
      if (!auth || typeof auth.signInWithEmailAndPassword !== 'function') {
        throw new Error('Firebase Authentication is not properly configured');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Try to update last login time (optional)
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Could not update last login time:', firestoreError);
      }

      // Get user profile
      const profile = await this.getUserProfile(user.uid);

      return { user, profile };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email using action code from verification link
   */
  static async verifyEmail(actionCode: string): Promise<{ success: boolean; user?: User }> {
    try {
      // Apply the email verification code
      await applyActionCode(auth, actionCode);

      // Get current user and reload to get updated emailVerified status
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        
        // Update user document in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          emailVerifiedAt: serverTimestamp()
        });

        return { success: true, user };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      const actionCodeSettings: ActionCodeSettings = {
        url: this.VERIFICATION_URL,
        handleCodeInApp: true
      };

      await sendEmailVerification(user, actionCodeSettings);
      return true;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<boolean> {
    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset with new password
   */
  static async confirmPasswordReset(actionCode: string, newPassword: string): Promise<boolean> {
    try {
      // Verify the password reset code
      await verifyPasswordResetCode(auth, actionCode);
      
      // Confirm the password reset
      await confirmPasswordReset(auth, actionCode, newPassword);
      
      return true;
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfileData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      return userDoc.data() as UserProfileData;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(uid: string, updates: Partial<UserProfileData>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  /**
   * Check if user email is verified
   */
  static async isEmailVerified(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    // Reload user to get latest verification status
    await user.reload();
    return user.emailVerified;
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Handle Firebase Auth errors and convert to user-friendly messages
   */
  private static handleAuthError(error: any): Error {
    let message = 'An unexpected error occurred';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password accounts are not enabled';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/invalid-action-code':
        message = 'Invalid or expired verification link';
        break;
      case 'auth/expired-action-code':
        message = 'Verification link has expired';
        break;
      case 'auth/too-many-requests':
        message = 'Too many requests. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }

    return new Error(message);
  }

  /**
   * Parse action code from URL parameters
   */
  static parseActionCode(url: string): { mode: string; oobCode: string } | null {
    try {
      const urlObj = new URL(url);
      const mode = urlObj.searchParams.get('mode');
      const oobCode = urlObj.searchParams.get('oobCode');

      if (mode && oobCode) {
        return { mode, oobCode };
      }

      return null;
    } catch (error) {
      console.error('Error parsing action code:', error);
      return null;
    }
  }

  /**
   * Handle Firebase Auth action (verification, password reset, etc.)
   */
  static async handleAuthAction(mode: string, actionCode: string): Promise<any> {
    switch (mode) {
      case 'verifyEmail':
        return await this.verifyEmail(actionCode);
      case 'resetPassword':
        // For password reset, we just verify the code
        // The actual reset happens in confirmPasswordReset
        await verifyPasswordResetCode(auth, actionCode);
        return { success: true, mode: 'resetPassword' };
      default:
        throw new Error(`Unsupported action mode: ${mode}`);
    }
  }
}