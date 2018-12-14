<?php

/**
 * @file
 * Load a source file, replace tokens and save to dist folder.
 */

namespace AKlump\WebPackage;

$build
  ->loadFile('src/jquery.loft-labels.js')
  ->replaceTokens()
  ->saveToDist()
  ->minifyFile('dist/jquery.loft-labels.js')
  ->addFilesToScm([
    "dist/jquery.loft-labels.js",
    "dist/jquery.loft-labels.min.js",
  ])
  ->displayMessages();
