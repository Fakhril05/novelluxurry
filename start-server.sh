#!/bin/bash
cd /home/z/my-project/.next/standalone
exec PORT=$1 HOSTNAME=0.0.0.0 node server.js
