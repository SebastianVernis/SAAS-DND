# Conductor Workflow

## Overview

This document defines the development workflow, task management, and quality standards for the SAAS-DND project using the Conductor methodology.

---

## Development Workflow

### Task Execution Process

1. **Track Selection** - Choose a track from `tracks.md`
2. **Plan Review** - Review the track's `plan.md` and `spec.md`
3. **Implementation** - Execute tasks sequentially following the plan
4. **Testing** - Run tests after each task completion
5. **Verification** - Verify changes meet requirements
6. **Commit** - Commit changes with descriptive messages
7. **Documentation** - Update relevant documentation

---

## Quality Standards

### Code Coverage

**Required Test Coverage: >80%**

- All new features must include tests
- Critical paths require 100% coverage
- Run tests before committing: `npm test`
- Check coverage: `npm test -- --coverage`

### Code Quality Checks

Before committing, ensure:
- ✅ TypeScript compilation passes: `npm run type-check`
- ✅ Linting passes: `npm run lint`
- ✅ Tests pass: `npm test`
- ✅ Build succeeds: `npm run build`

---

## Git Workflow

### Commit Strategy

**Commit changes after every task**

Each task completion should result in a commit with:
- Clear, descriptive commit message
- Reference to the task/track
- Summary of changes made

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `perf`: Performance improvements
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): Add JWT token refresh mechanism

- Implement refresh token endpoint
- Add token expiration handling
- Update auth middleware

Track: auth_improvements_20251228
Task: Implement token refresh
```

```
fix(editor): Resolve component drag-and-drop issue

- Fix z-index conflict in canvas
- Update drop zone detection logic
- Add visual feedback for valid drop zones

Track: editor_fixes_20251228
Task: Fix drag-and-drop bugs
```

### Git Notes for Task Summaries

**Use Git Notes to record task summaries**

After completing each task, add a git note with:
```bash
git notes add -m "Task: <task_name>
Status: Completed
Changes: <summary>
Tests: <test_results>
Track: <track_id>"
```

**Example:**
```bash
git notes add -m "Task: Implement user authentication
Status: Completed
Changes: Added JWT auth, login/register endpoints, password hashing
Tests: 15 new tests, all passing
Track: auth_system_20251228"
```

---

## Testing Requirements

### Test-Driven Development (TDD)

**Follow TDD principles for new features:**

1. **Write Tests First** - Define expected behavior
2. **Implement Feature** - Write minimal code to pass tests
3. **Refactor** - Improve code while keeping tests green

### Test Categories

**Unit Tests**
- Test individual functions and methods
- Mock external dependencies
- Fast execution (< 1s per test)
- Location: `__tests__` directories

**Integration Tests**
- Test API endpoints
- Test database operations
- Test service interactions
- Location: `tests/integration/`

**E2E Tests**
- Test complete user flows
- Test UI interactions
- Test real browser behavior
- Location: `tests/e2e/`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- auth

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm test -- --coverage
```

---

## Phase Completion Verification and Checkpointing Protocol

### Purpose

At the end of each phase in a track's plan, a manual verification checkpoint ensures:
- All phase tasks are truly complete
- Quality standards are met
- No regressions were introduced
- Documentation is updated

### Protocol Steps

When a phase completion task is encountered (format: `Task: Conductor - User Manual Verification '<Phase Name>'`):

1. **Pause Implementation**
   - Stop automated task execution
   - Present phase summary to user

2. **Present Checklist**
   ```
   Phase: <Phase Name>
   
   Completed Tasks:
   - [x] Task 1
   - [x] Task 2
   - [x] Task 3
   
   Quality Checks:
   - [ ] All tests passing
   - [ ] Code coverage >80%
   - [ ] TypeScript compilation successful
   - [ ] Linting passed
   - [ ] Build successful
   - [ ] Documentation updated
   
   Functional Verification:
   - [ ] Feature works as expected
   - [ ] No regressions in existing features
   - [ ] UI/UX meets requirements (if applicable)
   - [ ] API endpoints tested (if applicable)
   ```

3. **User Verification**
   - User manually tests the implemented features
   - User reviews code changes
   - User confirms quality standards met

4. **User Decision**
   - **Approve**: Continue to next phase
   - **Request Changes**: Return to specific tasks for fixes
   - **Add Tasks**: Insert additional tasks before proceeding

5. **Checkpoint Commit**
   - Create a checkpoint commit marking phase completion
   - Format: `chore(conductor): Complete phase '<Phase Name>'`
   - Include phase summary in commit body

6. **Continue or Pause**
   - If approved: Proceed to next phase
   - If changes needed: Address issues before continuing

### Example Checkpoint

```
Phase: Authentication System - Complete

Completed Tasks:
- [x] Implement JWT token generation
- [x] Create login endpoint
- [x] Create register endpoint
- [x] Add password hashing
- [x] Write authentication tests

Quality Checks:
- [x] All tests passing (93 tests)
- [x] Code coverage 87%
- [x] TypeScript compilation successful
- [x] Linting passed
- [x] Build successful
- [x] Documentation updated

Functional Verification:
- [x] Users can register successfully
- [x] Users can login with correct credentials
- [x] Invalid credentials are rejected
- [x] JWT tokens are properly generated
- [x] Password hashing works correctly

Status: ✅ APPROVED - Proceeding to next phase
```

---

## Code Review Guidelines

### Self-Review Checklist

Before marking a task as complete:

- [ ] Code follows style guides (TypeScript, React, Node.js)
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] Edge cases are handled
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Functions are small and focused
- [ ] Variable names are descriptive
- [ ] Comments explain "why", not "what"
- [ ] No hardcoded values (use constants/config)
- [ ] Security best practices followed

---

## Documentation Requirements

### Code Documentation

**JSDoc Comments** for:
- Public functions and methods
- Complex algorithms
- API endpoints
- Type definitions

**Example:**
```typescript
/**
 * Authenticates a user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password (plain text)
 * @returns Promise resolving to user object and JWT token
 * @throws {ApiError} When credentials are invalid
 */
async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  // implementation
}
```

### Track Documentation

**Update after each phase:**
- `spec.md` - If requirements change
- `plan.md` - Mark tasks as complete
- `README.md` - If user-facing changes
- `CHANGELOG.md` - Document notable changes

---

## Performance Guidelines

### Frontend Performance

- **Bundle Size**: Keep main bundle < 500KB
- **Code Splitting**: Lazy load routes and heavy components
- **Image Optimization**: Use WebP, lazy loading
- **Memoization**: Use React.memo, useMemo, useCallback appropriately

### Backend Performance

- **Response Time**: API endpoints < 200ms (P95)
- **Database Queries**: Use indexes, avoid N+1 queries
- **Caching**: Cache frequently accessed data in Redis
- **Connection Pooling**: Reuse database connections

---

## Security Checklist

### Every Task Must Consider:

- [ ] Input validation (Zod schemas)
- [ ] Output sanitization (prevent XSS)
- [ ] SQL injection prevention (use ORM)
- [ ] Authentication required for protected routes
- [ ] Authorization checks for sensitive operations
- [ ] Rate limiting on public endpoints
- [ ] HTTPS in production
- [ ] Secrets in environment variables (never hardcoded)
- [ ] CORS properly configured
- [ ] Security headers (Helmet.js)

---

## Deployment Checklist

### Before Deploying:

- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Error tracking enabled

---

## Track Management

### Creating a New Track

1. Define clear objective
2. Create track directory: `conductor/tracks/<track_id>/`
3. Write `spec.md` with detailed requirements
4. Generate `plan.md` with phased tasks
5. Add track to `conductor/tracks.md`
6. Create `metadata.json` with track info

### Track Structure

```
conductor/tracks/<track_id>/
├── metadata.json    # Track metadata
├── spec.md          # Detailed specification
├── plan.md          # Phased implementation plan
└── notes.md         # Implementation notes (optional)
```

### Track Lifecycle

1. **New** - Track created, not started
2. **In Progress** - Implementation ongoing
3. **Completed** - All tasks done, verified
4. **Cancelled** - Track abandoned

---

## Best Practices

### 1. Small, Focused Tasks

- Each task should take 15-30 minutes
- One clear objective per task
- Easy to test and verify

### 2. Incremental Progress

- Commit after each task
- Deploy frequently
- Get feedback early

### 3. Quality Over Speed

- Don't skip tests
- Don't skip code review
- Don't skip documentation

### 4. Communication

- Clear commit messages
- Detailed task notes
- Updated documentation

### 5. Continuous Improvement

- Refactor as you go
- Update patterns when better approaches found
- Learn from mistakes

---

## Emergency Procedures

### Rollback Process

If a deployment causes issues:

1. **Immediate**: Revert to previous commit
   ```bash
   git revert HEAD
   git push
   ```

2. **Investigate**: Identify root cause
3. **Fix**: Create hotfix branch
4. **Test**: Thoroughly test fix
5. **Deploy**: Deploy hotfix
6. **Post-Mortem**: Document what happened and how to prevent

### Hotfix Workflow

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix the issue
# ... make changes ...

# Test thoroughly
npm test
npm run test:e2e

# Commit and deploy
git commit -m "hotfix: Fix critical bug in authentication"
git push origin hotfix/critical-bug

# Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

---

## Metrics and Monitoring

### Track Progress Metrics

- Tasks completed vs. total
- Time per task (estimate vs. actual)
- Bugs found during implementation
- Test coverage trend

### Code Quality Metrics

- Test coverage percentage
- Linting errors/warnings
- TypeScript errors
- Build time
- Bundle size

### Performance Metrics

- API response times (P50, P95, P99)
- Frontend load time
- Database query performance
- Error rate

---

## Conclusion

This workflow ensures:
- ✅ High code quality through testing and reviews
- ✅ Clear progress tracking with commits and notes
- ✅ Consistent development practices
- ✅ Secure and performant code
- ✅ Comprehensive documentation

Follow this workflow for all tracks to maintain project quality and velocity.
