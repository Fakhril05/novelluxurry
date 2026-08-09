agent-browser open http://localhost:3000
sleep 6
echo '=== CATALOG ==='
agent-browser find text 'Catalog' click
sleep 5
agent-browser eval "document.body.innerText?.slice(0,200)"
echo ''
echo '=== CLICK FIRST BOOK ==='
agent-browser find text 'View Detail' click
sleep 5
echo "Book: $(agent-browser eval 'document.body.innerText?.slice(0,400)')"
echo ''
echo '=== SCROLL FOR REVIEWS ==='
agent-browser scroll down 1500
sleep 2
echo "Reviews: $(agent-browser eval 'document.body.innerText?.slice(0,500)')"
agent-browser screenshot /tmp/qa-reviews-section.png
echo ''
echo '=== BLOG ==='
agent-browser find text 'Blog' click
sleep 4
echo "Blog: $(agent-browser eval 'document.body.innerText?.slice(0,300)')"
echo ''
echo '=== DONE ==='
