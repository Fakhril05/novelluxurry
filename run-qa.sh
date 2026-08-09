#!/bin/bash
agent-browser open http://localhost:3000
sleep 6
echo '=== 1. HOMEPAGE ==='
echo "Title: $(agent-browser eval 'document.title')"
echo "Content: $(agent-browser eval 'document.body.innerText?.slice(0,250)')"
echo ''
echo '=== 2. CATALOG ==='
agent-browser find text 'Katalog' click
sleep 5
echo "Catalog: $(agent-browser eval 'document.body.innerText?.slice(0,300)')"
echo ''
echo '=== 3. FAQ ==='
agent-browser find text 'FAQ' click
sleep 4
echo "FAQ: $(agent-browser eval 'document.body.innerText?.slice(0,250)')"
echo ''
echo '=== 4. BLOG ==='
agent-browser find text 'Blog' click
sleep 4
echo "Blog: $(agent-browser eval 'document.body.innerText?.slice(0,250)')"
echo ''
echo '=== 5. DARK MODE ==='
agent-browser snapshot -i 2>&1 | rg 'Toggle theme'
agent-browser click @e5
sleep 2
echo "Theme: $(agent-browser eval "document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'")"
agent-browser click @e5
sleep 2
echo ''
echo '=== 6. LANGUAGE ==='
agent-browser snapshot -i 2>&1 | rg 'Toggle language'
agent-browser click @e4
sleep 2
echo "Lang: $(agent-browser eval 'document.body.innerText?.slice(0,150)')"
echo ''
echo '=== 7. BACK HOME ==='
agent-browser find text 'Beranda' click
sleep 4
echo "Home: $(agent-browser eval 'document.body.innerText?.slice(0,200)')"
echo ''
echo '=== SCREENSHOTS ==='
agent-browser screenshot /tmp/qa-home.png
echo 'Done'
