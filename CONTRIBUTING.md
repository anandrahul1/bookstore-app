# Contributing to Online Bookstore

## 🤖 Amazon Q Developer PR Review Process

This repository uses the **official Amazon Q Developer GitHub App** as an automated code reviewer. Here's how it works:

### How It Works

1. **Create a Pull Request** - Any commit to a feature branch
2. **Amazon Q Developer Reviews** - The official AI agent automatically analyzes your code for:
   - 🔒 Security vulnerabilities (hardcoded secrets, SQL injection, XSS)
   - 🎯 Code quality issues (best practices, maintainability)
   - 📝 Performance and optimization opportunities
   - 🚨 Error handling and reliability patterns

3. **Automated Decision**:
   - ✅ **Approved**: PR auto-merges if Amazon Q Developer approves
   - ❌ **Rejected**: PR blocked until Amazon Q Developer's issues are resolved

### What Amazon Q Developer Checks

#### Security Issues (CRITICAL/HIGH Priority)
- Hardcoded passwords, API keys, and secrets
- SQL injection vulnerabilities
- Cross-site scripting (XSS) risks
- Insecure authentication patterns
- Vulnerable dependencies

#### Code Quality (MEDIUM Priority)
- Coding best practices and standards
- Error handling completeness
- Performance optimization opportunities
- Code maintainability and readability
- Proper logging and monitoring

#### Architecture Compliance (LOW Priority)
- Microservices isolation principles
- Proper service boundaries
- Configuration management
- Database access patterns

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... code changes ...

# 3. Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# 4. Create PR on GitHub
# Amazon Q will automatically review and either:
# - Auto-merge if approved ✅
# - Block with feedback if issues found ❌
```

### Tips for Passing Amazon Q Review

✅ **Do:**
- Use environment variables for secrets
- Implement proper error handling with try/catch
- Use parameterized SQL queries
- Use strict equality operators (`===`, `!==`)
- Use `const/let` instead of `var`
- Add proper logging with frameworks

❌ **Don't:**
- Hardcode passwords or API keys
- Use string concatenation for SQL queries
- Leave async operations without error handling
- Use `console.log` in production services
- Use loose equality operators

### Example: Good vs Bad Code

**❌ Bad (Will be rejected):**
```javascript
// Hardcoded password
const password = "mypassword123";

// SQL injection risk
const query = "SELECT * FROM users WHERE id = " + userId;

// Missing error handling
const result = await db.execute(query);
```

**✅ Good (Will be approved):**
```javascript
// Environment variable
const password = process.env.DB_PASSWORD;

// Parameterized query
const query = "SELECT * FROM users WHERE id = ?";

// Proper error handling
try {
  const result = await db.execute(query, [userId]);
} catch (error) {
  logger.error('Database query failed:', error);
  throw error;
}
```

### Manual Override

If you need to override Amazon Q's decision:
1. Repository owners can manually merge after review
2. Add `[skip-q-review]` in commit message for urgent fixes
3. Contact repository maintainers for assistance

### Questions?

If Amazon Q flags something incorrectly or you need help:
- Check the PR comments for specific guidance
- Review this contributing guide
- Contact the repository maintainers
