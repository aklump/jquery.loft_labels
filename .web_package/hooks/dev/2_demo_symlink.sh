#!/bin/bash
# 
# @file
# Copy relevent files from parent into demo
#
test -e "$7/demo/jquery.loft_labels.js" && rm "$7/demo/jquery.loft_labels.js"
cd "$7/demo/" && ln -s "$7/jquery.loft_labels.js" .
