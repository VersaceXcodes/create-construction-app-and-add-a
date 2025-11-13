import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UV_Login from '@/components/views/UV_Login';
import { useAppStore } from '@/store/main';

// Wrapper for rendering components with Router
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E Flow (Real API)', () => {
  // Generate unique email for each test run to avoid conflicts
  const uniqueEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testPhone = '+15551234567';
  const testName = 'Test User';

  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    
    // Reset Zustand store to initial unauthenticated state
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        current_user: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
          is_verifying: false,
        },
        error_message: null,
      },
    }));
  });

  describe('Registration Flow', () => {
    it('should register a new user with unique email', async () => {
      const { register_user } = useAppStore.getState();
      const user = userEvent.setup();

      // Call register API directly through Zustand store
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      // Verify authentication state after registration
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
          expect(state.authentication_state.current_user).toBeTruthy();
          expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
          expect(state.authentication_state.current_user?.name).toBe(testName);
          expect(state.authentication_state.current_user?.role).toBe('customer');
        },
        { timeout: 20000 }
      );
    }, 30000);
  });

  describe('Login Flow', () => {
    it('should login successfully with registered credentials via UI', async () => {
      // First register the user
      const { register_user } = useAppStore.getState();
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      // Wait for registration to complete
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        },
        { timeout: 20000 }
      );

      // Logout to test login
      const { logout_user } = useAppStore.getState();
      logout_user();

      // Verify logged out
      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        expect(state.authentication_state.auth_token).toBeNull();
      });

      // Now render login form and test login
      render(<UV_Login />, { wrapper: Wrapper });

      const user = userEvent.setup();

      // Find form fields - using flexible regex patterns
      const emailInput = await screen.findByLabelText(/email.*phone/i);
      const passwordInput = await screen.findByLabelText(/^password$/i);
      const submitButton = await screen.findByRole('button', { name: /sign in/i });

      // Ensure inputs are enabled before typing
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
      });

      // Fill in the form
      await user.type(emailInput, uniqueEmail);
      await user.type(passwordInput, testPassword);

      // Wait for button to be enabled (form validation)
      await waitFor(() => expect(submitButton).not.toBeDisabled(), { timeout: 5000 });

      // Submit the form
      await user.click(submitButton);

      // Loading indicator should appear
      await waitFor(
        () => expect(screen.getByText(/logging in/i)).toBeInTheDocument(),
        { timeout: 5000 }
      );

      // Wait for auth to complete and store to reflect authenticated state
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
          expect(state.authentication_state.current_user).toBeTruthy();
          expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
        },
        { timeout: 20000 }
      );
    }, 45000);
  });

  describe('Logout Flow', () => {
    it('should logout successfully after login', async () => {
      // Register and login
      const { register_user } = useAppStore.getState();
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      // Verify logged in
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        },
        { timeout: 20000 }
      );

      // Logout
      const { logout_user } = useAppStore.getState();
      logout_user();

      // Verify logged out
      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        expect(state.authentication_state.auth_token).toBeNull();
        expect(state.authentication_state.current_user).toBeNull();
      });
    }, 30000);
  });

  describe('Complete Auth Flow: Register -> Logout -> Login', () => {
    it('should complete full auth cycle successfully', async () => {
      const user = userEvent.setup();

      // Step 1: Register
      const { register_user } = useAppStore.getState();
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      // Verify registration successful
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
          expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
        },
        { timeout: 20000 }
      );

      // Step 2: Logout
      const { logout_user } = useAppStore.getState();
      logout_user();

      // Verify logout successful
      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        expect(state.authentication_state.auth_token).toBeNull();
      });

      // Step 3: Login via UI
      render(<UV_Login />, { wrapper: Wrapper });

      const emailInput = await screen.findByLabelText(/email.*phone/i);
      const passwordInput = await screen.findByLabelText(/^password$/i);
      const submitButton = await screen.findByRole('button', { name: /sign in/i });

      // Fill in credentials
      await user.type(emailInput, uniqueEmail);
      await user.type(passwordInput, testPassword);

      // Wait for form validation
      await waitFor(() => expect(submitButton).not.toBeDisabled());

      // Submit
      await user.click(submitButton);

      // Verify loading state
      await waitFor(() => expect(screen.getByText(/logging in/i)).toBeInTheDocument());

      // Verify login successful
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
          expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
        },
        { timeout: 20000 }
      );

      // Step 4: Logout again to clean up
      logout_user();

      // Verify final logout
      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      });
    }, 60000);
  });

  describe('Invalid Credentials', () => {
    it('should show error for invalid login credentials', async () => {
      render(<UV_Login />, { wrapper: Wrapper });

      const user = userEvent.setup();

      const emailInput = await screen.findByLabelText(/email.*phone/i);
      const passwordInput = await screen.findByLabelText(/^password$/i);
      const submitButton = await screen.findByRole('button', { name: /sign in/i });

      // Try to login with invalid credentials
      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'WrongPassword123!');

      await waitFor(() => expect(submitButton).not.toBeDisabled());
      await user.click(submitButton);

      // Should show loading
      await waitFor(() => expect(screen.getByText(/logging in/i)).toBeInTheDocument());

      // Should show error message
      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.error_message).toBeTruthy();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        },
        { timeout: 20000 }
      );

      // Error should be displayed in UI
      await waitFor(
        () => {
          const errorElement = screen.getByRole('alert');
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 30000);
  });

  describe('Store Persistence', () => {
    it('should persist auth token in localStorage after registration', async () => {
      const { register_user } = useAppStore.getState();
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        },
        { timeout: 20000 }
      );

      // Check localStorage for persisted state
      const persistedState = localStorage.getItem('buildeasy-app-storage');
      expect(persistedState).toBeTruthy();

      const parsedState = JSON.parse(persistedState!);
      expect(parsedState.state.authentication_state.auth_token).toBeTruthy();
      expect(parsedState.state.authentication_state.current_user.email).toBe(uniqueEmail);
    }, 30000);

    it('should clear localStorage after logout', async () => {
      // Register first
      const { register_user } = useAppStore.getState();
      await register_user({
        email: uniqueEmail,
        phone: testPhone,
        password: testPassword,
        name: testName,
        role: 'customer',
        account_type: 'personal',
      });

      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        },
        { timeout: 20000 }
      );

      // Logout
      const { logout_user } = useAppStore.getState();
      logout_user();

      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      });

      // Check localStorage - should still exist but auth_token should be null
      const persistedState = localStorage.getItem('buildeasy-app-storage');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        expect(parsedState.state.authentication_state.auth_token).toBeNull();
        expect(parsedState.state.authentication_state.current_user).toBeNull();
      }
    }, 30000);
  });
});
