# Contributing to SAAS-DND

## 🎉 Welcome!

Thanks for considering contributing to SAAS-DND! This document provides guidelines for contributing to the project.

## 📋 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND

# Install dependencies
pnpm install

# Setup backend
cd apps/api
cp .env.example .env
# Edit .env with your credentials

# Setup database
pnpm db:push

# Start development
cd ../..
pnpm dev
```

## 🌿 Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release branches

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples
```
feat(auth): add OTP verification via email
fix(team): resolve invitation expiration bug
docs(api): update endpoint documentation
refactor(db): optimize query performance
```

## 🔄 Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Test Locally
```bash
# Run all tests
pnpm test

# Run linting
pnpm lint

# Type check
pnpm type-check
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat(scope): your changes"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### 6. PR Requirements

Your PR must:
- [ ] Pass all CI checks
- [ ] Include tests for new functionality
- [ ] Update relevant documentation
- [ ] Follow code style guidelines
- [ ] Have a clear description
- [ ] Reference related issues

## 🧪 Testing Guidelines

### Backend Tests
```bash
cd apps/api
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

### Frontend Tests
```bash
cd apps/web
pnpm test              # All tests
pnpm test:e2e          # E2E tests
```

### Test Structure
```typescript
describe('Feature Name', () => {
  describe('Function Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## 💻 Code Style

### TypeScript
- Use TypeScript for all new code
- Define types/interfaces explicitly
- Avoid `any` type
- Use strict mode

### Naming Conventions
- **Files:** kebab-case (e.g., `user-service.ts`)
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Functions:** camelCase (e.g., `getUserById()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces:** PascalCase with 'I' prefix (e.g., `IUser`)
- **Types:** PascalCase (e.g., `UserRole`)

### Code Organization

**Backend Module Structure:**
```
modules/feature-name/
├── feature.controller.ts    # HTTP handlers
├── feature.service.ts       # Business logic
├── feature.routes.ts        # Route definitions
├── feature.types.ts         # TypeScript types
├── feature.validation.ts    # Zod schemas
└── feature.test.ts          # Tests
```

**Frontend Component Structure:**
```
components/FeatureName/
├── FeatureName.tsx          # Main component
├── FeatureName.types.ts     # Component types
├── FeatureName.test.tsx     # Tests
├── FeatureName.stories.tsx  # Storybook (optional)
└── index.ts                 # Barrel export
```

## 📚 Documentation

### Code Documentation
- Use JSDoc/TSDoc for functions
- Comment complex logic
- Keep comments up to date

### README Updates
- Update README.md if adding features
- Update API documentation
- Update architecture docs if needed

## 🔍 Code Review

### As a Reviewer
- Be constructive and respectful
- Test the changes locally
- Check for edge cases
- Verify tests coverage

### As a Contributor
- Respond to feedback promptly
- Make requested changes
- Keep PR scope focused
- Rebase if needed

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md):
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error logs

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md):
- Problem statement
- Proposed solution
- User impact
- Technical considerations

## 🎨 Design Guidelines

### UI/UX
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Consistent spacing (TailwindCSS)
- Clear user feedback
- Loading states
- Error handling

### API Design
- RESTful principles
- Consistent naming
- Proper HTTP status codes
- Error responses format
- Versioning (if needed)

## 🔐 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email: security@saasdnd.com
- Use responsible disclosure

### Security Checklist
- [ ] No secrets in code
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting

## 📈 Performance

### Guidelines
- Database queries optimized (use indexes)
- API responses < 200ms (p95)
- Frontend bundle < 500KB
- Images optimized
- Lazy loading implemented

## 🌍 Internationalization

- Use translation keys, not hardcoded text
- Support es and en initially
- Use proper date/time formatting
- Currency formatting by locale

## 🙏 Thank You!

Your contributions make SAAS-DND better for everyone!

## 📞 Questions?

- GitHub Discussions
- Discord: [link]
- Email: dev@saasdnd.com

---

**Happy coding!** 🎨
