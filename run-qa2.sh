#!/bin/bash
agent-browser open http://localhost:3000
sleep 6
echo '=== HOMEPAGE ==='
agent-browser find text 'Home' click
sleep 4
echo "Home: $(agent-browser eval 'document.body.innerText?.slice(0,200)')"
echo ''
echo '=== BOOK DETAIL ==='
agent-browser find text 'Catalog' click
sleep 5
agent-browser find text 'View details' click
sleep 5
echo "Book: $(agent-browser eval 'document.body.innerText?.slice(0,400)')"
echo ''
echo '=== SCREENSHOT ==='
agent-browser screenshot /tmp/qa-book.png
echo 'Done'
