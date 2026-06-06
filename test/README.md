# Unit Tests Documentation

## Overview
Comprehensive unit tests for the Notes API using **Mocha** (test runner) and **Chai** (assertion library).

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx mocha test/unit/utils/AppError.test.js
```

### Run with Custom Log Level
```bash
LOG_LEVEL=debug npm test
```

## Test Structure

```
test/
├── setup.js                    # Test environment setup
├── unit/
│   ├── utils/
│   │   ├── AppError.test.js   # Error class tests
│   │   └── asyncHandler.test.js # Async handler tests
│   ├── store/
│   │   └── memoryStore.test.js # Data store tests
│   ├── middleware/
│   │   ├── auth.test.js       # Auth middleware tests
│   │   └── errorHandler.test.js # Error handler tests
│   └── routes/
│       └── routes.test.js      # Route and integration tests
```

## Test Coverage

### Utilities (test/unit/utils/)

#### AppError.test.js
- ✅ AppError class creation with default/custom values
- ✅ ValidationError with 400 status code
- ✅ UnauthorizedError with 401 status code
- ✅ ForbiddenError with 403 status code
- ✅ NotFoundError with 404 status code
- ✅ ConflictError with 409 status code
- ✅ Error details preservation
- ✅ Error inheritance chain

**Coverage**: All error classes and their properties

#### asyncHandler.test.js
- ✅ Function wrapping and middleware creation
- ✅ Successful async operation execution
- ✅ Error catching and passing to next()
- ✅ Promise rejection handling
- ✅ Maintains correct function signature

**Coverage**: Async wrapper functionality and error handling

### Data Store (test/unit/store/)

#### memoryStore.test.js
- ✅ User creation and retrieval
- ✅ Email-based user lookup (case-insensitive)
- ✅ ID-based user lookup
- ✅ Note creation and retrieval
- ✅ Note updates (partial and full)
- ✅ Note deletion
- ✅ Notes sorted by updatedAt (descending)
- ✅ User isolation (only view own notes)
- ✅ Multiple notes per user
- ✅ Empty result handling

**Coverage**: All CRUD operations on users and notes

### Middleware (test/unit/middleware/)

#### auth.test.js
- ✅ User object creation with valid headers
- ✅ Default values for missing headers
- ✅ next() invocation after authentication
- ✅ UnauthorizedError when user ID missing
- ✅ Empty user ID handling
- ✅ No user object set on failure
- ✅ Header normalization

**Coverage**: Authentication middleware logic

#### errorHandler.test.js
- ✅ Operational error handling
- ✅ Unhandled error handling (500)
- ✅ Errors without user context
- ✅ Consistent response format
- ✅ Custom status codes
- ✅ Error details inclusion
- ✅ Not found handler (404)
- ✅ Route not found detection

**Coverage**: Error handling and response formatting

### Routes (test/unit/routes/)

#### routes.test.js

**Auth Routes**
- ✅ Required field validation (signup)
- ✅ Password minimum length enforcement
- ✅ Email normalization
- ✅ Credentials requirement (login)
- ✅ Password hashing consistency
- ✅ Different hashes for different emails

**Notes Routes**
- ✅ Authentication requirement
- ✅ Note content validation (title or content required)
- ✅ Partial updates (title only, content only)
- ✅ User authorization checks
- ✅ Prevent access to other user's notes
- ✅ Note ownership validation

**Health Routes**
- ✅ Service status response format
- ✅ Valid ISO timestamp
- ✅ HTTP 200 status code

**Response Format**
- ✅ Success response structure
- ✅ Error response structure
- ✅ Request ID inclusion

**Coverage**: Route logic, validation, and authorization

## Test Statistics

| Component | Test Suite | Tests | Status |
|-----------|-----------|-------|--------|
| AppError | 6 | 21 | ✅ |
| asyncHandler | 1 | 5 | ✅ |
| memoryStore | 2 | 20 | ✅ |
| auth middleware | 1 | 7 | ✅ |
| errorHandler | 1 | 7 | ✅ |
| routes | 3 | 22 | ✅ |
| **TOTAL** | **14** | **82** | **✅** |

## Key Test Features

### Isolation
- Each test is independent
- No shared state between tests
- Clean setup and teardown

### Comprehensive Coverage
- Happy path scenarios
- Error conditions
- Edge cases
- Authorization checks

### Clear Assertions
- Descriptive test names
- Specific assertions
- Clear error messages

### Maintainability
- Organized test structure
- Reusable test helpers
- Consistent patterns

## Running Specific Tests

### Run all error tests
```bash
npx mocha test/unit/utils/AppError.test.js
```

### Run all middleware tests
```bash
npx mocha test/unit/middleware/**/*.test.js
```

### Run all store tests
```bash
npx mocha test/unit/store/**/*.test.js
```

## Chai Assertion Patterns Used

```javascript
// Equality
expect(value).to.equal(expected)
expect(value).to.deep.equal(expectedObject)

// Type checks
expect(value).to.be.true
expect(value).to.be.false
expect(value).to.be.null
expect(value).to.be.undefined
expect(value).to.be.a('string')

// Object/Array checks
expect(obj).to.have.property('key')
expect(array).to.have.lengthOf(3)
expect(array).to.be.empty
expect(array.every(item => condition)).to.be.true

// Instance checks
expect(obj).to.be.instanceOf(ClassName)

// Numeric checks
expect(num).to.be.greaterThan(min)
expect(num).to.be.lessThan(max)

// String/Pattern checks
expect(string).to.include('substring')
expect(string).to.match(/regex/)
```

## Adding New Tests

### Template for new test file
```javascript
import { expect } from 'chai'
import { moduleToTest } from '../../../server/path/to/module.js'

describe('Module Name', () => {
  describe('Feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = { /* test data */ }
      
      // Act
      const result = moduleToTest(input)
      
      // Assert
      expect(result).to.equal(expected)
    })
  })
})
```

### Best Practices
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test one thing per test
4. Use beforeEach/afterEach for setup/cleanup
5. Mock external dependencies
6. Test both success and failure paths

## Continuous Integration

To run tests in CI/CD pipeline:

```bash
npm test
```

Exit code will be:
- `0` - All tests passed
- `1` - Any test failed

## Debugging Tests

### Run with verbose output
```bash
npx mocha test/**/*.test.js --reporter json > test-results.json
```

### Debug single test
```bash
node --inspect-brk ./node_modules/.bin/mocha test/unit/utils/AppError.test.js
```

Then open Chrome DevTools and connect to the debugger.

## Future Test Improvements

- [ ] Add integration tests with actual HTTP requests
- [ ] Add performance benchmarks
- [ ] Add E2E tests with multiple operations
- [ ] Add database tests with real DB
- [ ] Increase coverage target to 90%
- [ ] Add security tests (XSS, injection)
