agent-browser open http://localhost:3000
sleep 6
agent-browser eval "
  const store = JSON.parse(localStorage.getItem('noveluxe-store'));
  store.state.page = 'book-detail';
  store.state.pageParams = { slug: 'the-library-of-lost-things' };
  localStorage.setItem('noveluxe-store', JSON.stringify(store));
  'nav'
"
agent-browser reload
sleep 8
agent-browser eval "window.scrollTo(0, document.body.scrollHeight)"
sleep 2
echo "Full bottom: $(agent-browser eval 'document.body.innerText?.slice(0,600)')"
agent-browser screenshot /tmp/qa-bookdetail-bottom.png
echo 'Done'
