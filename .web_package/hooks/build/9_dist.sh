#!/bin/bash
# 
# @file
# Copy distribution files to /dist
# 
sleep 3

(! test -e "$7/dist" || rm -r "$7/dist") && mkdir -p "$7/dist"

# Javascript
cp "$7/jquery.loft_labels.js" "$7/dist/"
test -e "$7/jquery.loft_labels.min.js" && cp "$7/jquery.loft_labels.min.js" "$7/dist/"
