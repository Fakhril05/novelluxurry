agent-browser open http://localhost:3000
sleep 6
agent-browser eval ""
  const store = JSON.parse(localStorage.getItem('noveluxe-store'));
  store.state.page = 'book-detail';
  store.state.pageParams = { slug: 'the-library-of-lost-things' };
  localStorage.setItem('noveluxe-store', JSON.stringify(store));
  '
'
"
agent-browser reload
sleep 8
agent-browser eval "window.scrollTo(0, 99999)"
sleep 3
echo "Bottom: $(agent-browser eval 'document.body.innerText?.slice(-600)')"
echo 'Done'
