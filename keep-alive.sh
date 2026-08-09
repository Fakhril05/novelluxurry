#!/bin/bash
cd /home/z/my-project
rm -f dev.log
npx next dev -p 3000 > dev.log 2>&1 &
echo "Server starting on port 3000..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null | grep -q 200; then
    echo "Server ready!"
    break
  fi
  sleep 1
done
echo "Server is running. Keeping alive..."
tail -f dev.log
