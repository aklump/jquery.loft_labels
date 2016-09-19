#!/usr/bin/env bash
cd "$7/demo/" && (! test -e "jquery.loft_labels.js" || rm "jquery.loft_labels.js") &&  ln -s "$7/jquery.loft_labels.js" .
