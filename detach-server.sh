#!/bin/bash
cd /home/z/my-project/.next/standalone
PORT=$1 HOSTNAME=0.0.0.0 node server.js >/tmp/nextjs-$1.log 2>&1
