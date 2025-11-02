---
description: Git commit and push all changes
---

Please commit all changes and push to the remote repository following these steps:

1. Run `git status` to see all changes
2. Run `git diff` to review the specific changes
3. Run `git log --oneline -5` to understand the commit history style
4. Stage all relevant files (excluding sensitive files like .env, credentials, etc.)
5. Create a descriptive commit message that:
   - Summarizes the nature of changes in Chinese (since this is a Chinese project)
   - Follows the existing commit message style
   - Focuses on the "why" rather than the "what"
   - Ends with the standard Claude Code signature:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```
6. Push to the remote repository
7. Show final git status to confirm

IMPORTANT:
- Do NOT commit files that contain secrets (.env, credentials.json, etc.)
- Warn if attempting to commit sensitive files
- Use heredoc format for commit message to ensure proper formatting
- Do NOT use --no-verify or skip hooks
