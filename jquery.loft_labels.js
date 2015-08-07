/*!
 * Loft Labels jQuery JavaScript Plugin v0.3.2
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013, Aaron Klump
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Fri Aug  7 15:48:02 PDT 2015
 */
;(function($, undefined) {
"use strict";

$.fn.loftLabels = function(options) {
  var $elements = $(this);

  // Do nothing when nothing selected
  if ($elements.length === 0) {
    return;
  }

  // Create some defaults, extending them with any options that were provided
  var settings = $.extend({}, $.fn.loftLabels.defaults, options);

  $elements.not('.' + settings.cssPrefix + '-processed')
  .addClass(settings.cssPrefix + '-processed');

  $elements.each(function () {

    // Setup: Move the label into the field
    var $input = $(this);
    var id = $input.attr('id');
    var $label = $input.siblings('label[for=' + id + ']');
    $label.hide();
    var defaultText = $.trim($label.text());
    if (settings.callback) {
      defaultText = settings.callback(defaultText);
    }
    if ($input.val()) {
      $input.addClass(settings.focus);
      return $(this);
    }
    else {
      $input.val(defaultText);
      $input.removeClass(settings.focus);
    }

    // Handlers
    $input
    .click(function() {
      $input.addClass(settings.focus);
      if ($.trim($input.val()) === defaultText) {
        $input.val('');
      }
    })
    .focus(function() {
      $input.addClass(settings.focus);
      if ($.trim($input.val()) === defaultText) {
        $input.val('');
      }
    })
    .hover(function() {
      $input.addClass(settings.hover);
    }, function() {
      $input.removeClass(settings.hover);
    })
    .blur(function() {
      if (!$.trim($input.val())) {
        $input
        .val(defaultText)
        .removeClass(settings.focus)
        .removeClass(settings.hover);
      }
    });
  });

  return this;
};

$.fn.loftLabels.defaults = {

  // The class to add to the text field when it's in focus.
  "focus"     : "focus",

  // The class to add to the tf when it's being hovered.
  "hover"     : "hover",

  // a function that will receive the label string and return a
  // modified version of the label string. use this to alter the
  // label string before it's placed into the textfield.
  "callback"  : null,
  
  // A prefix for all css classes
  "cssPrefix" : 'loft-labels'
};

$.fn.loftLabels.version = function() { return '0.3.0'; };

})(jQuery);