#!/usr/bin/env bash
#
# @file
# This will create symlinks from the dist folder to the main during development.
#

# Javascript
cd "$7/dist" && rm jquery.loft_labels.js && ln -s "$7/jquery.loft_labels.js" .
test -e "$7/jquery.loft_labels.min.js" && cd "$7/dist" && rm jquery.loft_labels.min.js && ln -s "$7/jquery.loft_labels.min.js" .


