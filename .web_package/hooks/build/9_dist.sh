#!/bin/bash
# 
# @file
# Copy distribution files to /dist
# 
# Allow time for all CodeKit to minify.
while [ ! -f "$7/jquery.loft_labels.min.js" ]; do
  sleep 1
done

test -d "$7/dist" || mkdir "$7/dist"

# Javascript
cp "$7/jquery.loft_labels.js" "$7/dist/"
cp "$7/jquery.loft_labels.min.js" "$7/dist/"
