#!/bin/bash

# MC Platform - Auto Git Push Script
# Usage: ./git-push.sh "commit message"

cd /home/user01/mc-platform

# Check if there are changes
if [[ -z $(git status -s) ]]; then
  echo "📭 No changes to commit"
  exit 0
fi

# Show changes
echo "📝 Changes detected:"
echo ""
git status -s
echo ""

# Add all changes
git add .

# Commit with message
if [ -z "$1" ]; then
  COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
else
  COMMIT_MSG="$1"
fi

git commit -m "$COMMIT_MSG"

# Show commit details
echo ""
echo "✅ Committed:"
git log -1 --stat
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin master

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully pushed to: https://github.com/ycozzz/mc-platform"
  echo ""
  echo "📊 Change Summary:"
  git diff HEAD~1 --stat
else
  echo "❌ Push failed!"
  exit 1
fi
