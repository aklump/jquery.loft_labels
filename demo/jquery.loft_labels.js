/**
 * Loft Labels jQuery JavaScript Plugin v0.4.1
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013, Aaron Klump
 * @license [name]Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Sat Aug 15 10:02:01 PDT 2015
 */
;(function($, undefined) {
"use strict";

$.fn.loftLabels = function(options, instances) {
  instances     = instances || [];
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
    var el       = this;
    var instance = {
      el: el,
      $el: $(el),
      defaultText: null,
      settings: settings,

      /**
       * (Re-)Initialize the form element.
       */
      init: function() {
        var id          = $(el).attr('id');
        var $label      = $('label[for=' + id + ']');
        var defaultText = '';
        
        // Determine the default text from the label tag...
        if ($label.length) {
          defaultText = $.trim($label.text());
          $label.hide();
        }

        // Modify the default text...
        if (typeof settings.callback === 'function') {
          defaultText = settings.callback(defaultText);
        }

        if ($label.length) {
          $label.text(defaultText);
        }

        if ($(el).val()) {
          $(el).addClass(settings.focus);
          return $(this);
        }
        else {
          $(el).val(defaultText);
          $(el).removeClass(settings.focus);
        }
        this.defaultText = defaultText;

        if (typeof settings.onInit === 'function') {
          settings.onInit(this);
        }

        return this;
      },

      value: function () {
        return $.trim($(el).val());
      },

      clear: function () {
        if (this.value() === this.defaultText) {
          $(el).val('');
        }    
      },

      unclear: function () {
        if (!this.value() && this.defaultText) {
          this.default();
        }
      }, 

      default: function () {
        $(el).val(this.defaultText);
      }
    };

    instances.push(instance);
    instance.init();

    // Handlers
    $(el)
    .click(function() {
      $(el).addClass(settings.focus);
      instance.clear();
    })
    .focus(function() {
      $(el).addClass(settings.focus);
      instance.clear();
    })
    .hover(function() {
      $(el).addClass(settings.hover);
    }, function() {
      $(el).removeClass(settings.hover);
    })
    .blur(function() {
      $(el)
      .removeClass(settings.focus)
      .removeClass(settings.hover);
      instance.unclear();
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
  
  // A prefix for all css classes.
  "cssPrefix" : 'loft-labels',

  // a function to call after init has completed.
  "onInit": null
};

$.fn.loftLabels.version = function() { return '0.4.1'; };

})(jQuery);