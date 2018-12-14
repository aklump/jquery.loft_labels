#!/bin/bash
#
# @file
# Create the docs folder, which is the public demo on GitHub
#
wp_rm docs
mkdir docs
wp_duplicate "demo/package.json" "docs/package.json"
wp_duplicate "dist/jquery.loft-labels.js" "docs/jquery.loft-labels.js"
cd docs && yarn
