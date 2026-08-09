#!/bin/bash
agent-browser open http://localhost:3000
sleep 6

# 1. Homepage
echo '=== 1. HOMEPAGE ==='
echo "Title: $(agent-browser eval 'document.title')"
echo "Text: $(agent-browser eval 'document.body.innerText?.slice(0,250)')"
echo ''

# 2. Catalog
agent-browser find text 'Catalog' click
sleep 5
echo '=== 2. CATALOG ==='
echo "Content: $(agent-browser eval 'document.body.innerText?.slice(0,300)')"
echo ''

# 3. Book Detail
agent-browser find text 'View Detail' click
sleep 5
echo '=== 3. BOOK DETAIL ==='
echo "Content: $(agent-browser eval 'document.body.innerText?.slice(0,500)')"
agent-browser screenshot /tmp/qa-book-detail.png
echo ''

# 4. Blog
echo '=== 4. BLOG ==='
agent-browser find text 'Blog' click
sleep 4
echo "Content: $(agent-browser eval 'document.body.innerText?.slice(0,300)')"
echo ''

# 5. FAQ
echo '=== 5. FAQ ==='
agent-browser find text 'FAQ' click
sleep 4
echo "Content: $(agent-browser eval 'document.body.innerText?.slice(0,250)')"
echo ''

# 6. Dark mode
echo '=== 6. THEME ==='
agent-browser snapshot -i 2>&1 | rg 'Toggle theme'
agent-browser click @e5
sleep 2
echo "Dark: $(agent-browser eval "document.documentElement.classList.contains('dark') ? 'ON' : 'OFF'")"
agent-browser click @e5
sleep 2
echo ''

echo '=== QA DONE ==='
