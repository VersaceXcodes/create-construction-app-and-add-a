# E2E Authentication Tests

## Overview

This directory contains end-to-end (E2E) authentication tests for the BuildEasy platform. These tests use **real API calls** to the backend server and verify the complete authentication flow.

## Test File

- `auth.e2e.test.tsx` - Complete authentication flow tests (register → logout → login)

## Prerequisites

1. **Backend server must be running** at `http://localhost:3000`
   ```bash
   cd ../backend
   npm run dev
   ```

2. **Database must be accessible** with the schema from `backend/db.sql`

3. **Environment variables** should be set in `.env.test`:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

## Running Tests

### Run all tests
```bash
npm test
```

### Run only auth tests
```bash
npm test auth.e2e
```

### Run with UI (Vitest UI)
```bash
npm run test:ui
```

### Run in watch mode
```bash
npm test -- --watch
```

## Test Coverage

### ✅ Registration Flow
- Registers a new user with unique timestamped email
- Verifies auth token is generated
- Verifies user data is stored correctly
- Checks Zustand store state

### ✅ Login Flow
- Tests login with registered credentials via UI
- Verifies form validation
- Tests loading states
- Verifies successful authentication

### ✅ Logout Flow
- Tests logout functionality
- Verifies store state is cleared
- Verifies localStorage is updated

### ✅ Complete Cycle
- Register → Logout → Login → Logout
- Verifies each step in sequence
- Tests full user journey

### ✅ Error Handling
- Tests invalid credentials
- Verifies error messages are displayed
- Tests authentication remains false on failure

### ✅ Persistence
- Tests localStorage persistence
- Verifies auth token is saved
- Tests token is cleared on logout

## Test Strategy

### No Mocks
- **All API calls are real** - no mocking of fetch/axios
- Tests hit the actual backend server
- Ensures integration works end-to-end

### Unique Email Per Run
- Each test run generates a unique email: `testuser{timestamp}@example.com`
- Prevents conflicts with existing users
- Allows tests to run multiple times

### Store-Based Assertions
- Tests primarily assert on Zustand store state
- Verifies `authentication_state.authentication_status.is_authenticated`
- Checks `authentication_state.auth_token` presence
- Validates `authentication_state.current_user` data

### Resilient Selectors
- Uses flexible regex patterns for labels: `/email.*phone/i`
- Works with button variants: `/sign in|log in/i`
- Handles different label formats

## Architecture

### Component Import
Tests import `UV_Login` component directly and render it with `BrowserRouter`:

```tsx
import UV_Login from '@/components/views/UV_Login';
import { BrowserRouter } from 'react-router-dom';

const Wrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

render(<UV_Login />, { wrapper: Wrapper });
```

### Store Access
Direct access to Zustand store for both actions and state verification:

```tsx
import { useAppStore } from '@/store/main';

// Call actions
const { register_user, login_user, logout_user } = useAppStore.getState();

// Verify state
const state = useAppStore.getState();
expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
```

## Debugging

### View Test Output
Tests include detailed console output and error messages:
- Registration success/failure
- Login attempts
- Store state changes

### Common Issues

1. **Backend not running**
   - Error: `ECONNREFUSED` or network errors
   - Solution: Start backend server

2. **Database connection failed**
   - Error: Database-related errors in backend logs
   - Solution: Verify PostgreSQL is running and accessible

3. **Unique email conflicts**
   - Rare case where timestamp collision occurs
   - Solution: Tests auto-generate unique emails, should be very rare

4. **Timeouts**
   - Tests have 30-60 second timeouts for complete flows
   - If hitting timeouts, check backend performance

## Configuration Files

- `vitest.config.ts` - Vitest configuration with jsdom, globals, and path aliases
- `src/test/setup.ts` - Test setup file that imports @testing-library/jest-dom
- `.env.test` - Environment variables for tests

## Best Practices

1. **Always start backend first** before running tests
2. **Run tests sequentially** to avoid race conditions (Vitest handles this by default)
3. **Check backend logs** if tests fail to see API errors
4. **Clear test data** periodically from database if needed
5. **Use unique emails** - tests already handle this automatically

## Future Enhancements

Potential additions:
- Password reset flow tests
- Email verification flow tests
- Multi-factor authentication tests
- Session timeout tests
- Concurrent login tests (same user, multiple devices)
