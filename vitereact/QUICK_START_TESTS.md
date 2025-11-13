# 🚀 Quick Start - E2E Auth Tests

## Prerequisites (5 minutes)

1. **Start Backend Server**
   ```bash
   cd /app/backend
   npm run dev
   # Backend should be running at http://localhost:3000
   ```

2. **Verify Backend is Running**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. **Verify Database Connection**
   - PostgreSQL should be running
   - Database should have schema from `backend/db.sql`

## Running Tests (1 command)

```bash
cd /app/vitereact
npm test
```

That's it! 🎉

## What Gets Tested

✅ **Complete Auth Flow:**
1. User registration with unique email
2. Login via UI form
3. Logout functionality
4. Invalid credentials handling
5. LocalStorage persistence

## Expected Output

```
✓ src/__tests__/auth.e2e.test.tsx (6 tests)
  ✓ Registration Flow
  ✓ Login Flow
  ✓ Logout Flow
  ✓ Complete Auth Cycle
  ✓ Invalid Credentials
  ✓ Store Persistence

Test Files  1 passed (1)
Tests  6 passed (6)
Duration  38-60s
```

## If Tests Fail

### Check Backend is Running
```bash
curl http://localhost:3000/api/health
```

### Check Backend Logs
Look for error messages in backend terminal

### Check Database
Ensure PostgreSQL is accessible

### Verify Environment
```bash
cat .env.test
# Should show: VITE_API_BASE_URL=http://localhost:3000
```

## Other Commands

```bash
# Watch mode (reruns on file changes)
npm run test:watch

# UI mode (visual test runner)
npm run test:ui

# Run specific test
npm test auth.e2e
```

## Test Details

- **No mocks** - Real API calls to backend
- **Unique emails** - Uses `testuser{timestamp}@example.com`
- **Clean state** - Each test starts fresh
- **Timeouts** - 30-60 seconds per test suite

## Files Created

```
/app/vitereact/
├── src/
│   ├── __tests__/
│   │   ├── auth.e2e.test.tsx       ← Main test file
│   │   └── README.md               ← Detailed documentation
│   └── test/
│       └── setup.ts                 ← Test setup (already existed)
├── vitest.config.ts                 ← Updated with path aliases
├── .env.test                        ← Test environment (already existed)
├── package.json                     ← Added test scripts
├── E2E_AUTH_TESTS_SUMMARY.md       ← Implementation summary
├── TEST_VERIFICATION_CHECKLIST.md  ← Verification checklist
└── QUICK_START_TESTS.md            ← This file
```

## Need Help?

See detailed documentation:
- `src/__tests__/README.md` - Complete test guide
- `E2E_AUTH_TESTS_SUMMARY.md` - Implementation details
- `TEST_VERIFICATION_CHECKLIST.md` - Verification checklist

---

**Ready to test? Just run:**
```bash
npm test
```

🎯 **That's all you need!**
