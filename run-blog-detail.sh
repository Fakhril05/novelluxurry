agent-browser open http://localhost:3000
sleep 6

# Set page state to blog-detail with slug
agent-browser eval "
  const store = JSON.parse(localStorage.getItem('noveluxe-store'));
  store.state.page = 'blog-detail';
  store.state.pageParams = { slug: 'novel-indonesia-terbaik-2024' };
  localStorage.setItem('noveluxe-store', JSON.stringify(store));
  'Navigated to blog detail';
"
sleep 1
# Reload to pick up the state change
agent-browser reload
sleep 8
echo "Blog detail: $(agent-browser eval 'document.body.innerText?.slice(0,500)')"
agent-browser screenshot /tmp/qa-blog-detail.png
echo 'Done'
