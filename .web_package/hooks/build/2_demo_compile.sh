#!/bin/bash
# 
# @file
# Copy relevent files from parent into demo
#
! test -e "$7/demo/jquery.loft_labels.js" || rm "$7/demo/jquery.loft_labels.js"
cp "$7/jquery.loft_labels.js" "$7/demo/"
