agent-browser open http://localhost:3000
sleep 6

# Navigate to book detail via store
agent-browser eval "
  const store = JSON.parse(localStorage.getItem('noveluxe-store'));
  store.state.page = 'book-detail';
  store.state.pageParams = { slug: 'the-library-of-lost-things' };
  localStorage.setItem('noveluxe-store', JSON.stringify(store));
  'navigated';
"
agent-browser reload
sleep 8
echo "Book: $(agent-browser eval 'document.body.innerText?.slice(0,400)')"
echo ''
# Scroll to reviews
agent-browser scroll down 3000
sleep 2
echo "Reviews section: $(agent-browser eval 'document.body.innerText?.slice(0,500)')"
agent-browser screenshot /tmp/qa-bookdetail-reviews.png
echo 'Done'
