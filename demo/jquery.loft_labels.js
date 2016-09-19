/**
 * Loft Labels jQuery JavaScript Plugin v0.6.5
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013, Aaron Klump
 * @license [name]Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Mon Sep 19 15:41:26 PDT 2016
 */
;(function ($, undefined) {
  "use strict";

  $.fn.loftLabels = function (options, instances) {
    instances = instances || [];
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
      var el  = this,
          $el = $(this);

      var instance = {
        el         : el,
        $el        : $(el),
        defaultText: null,
        settings   : settings,

        /**
         * (Re-)Initialize the form element.
         */
        init: function () {
          var _           = this,
              $label      = settings.labelSelector(_.$el),
              defaultText = '',
              tagName = _.$el.get(0).tagName.toLowerCase();

          // Determine the default text from the label tag...
          if (tagName === 'textarea') {
            defaultText = _.$el.text();
          }

          if ($label.length) {
            defaultText = $.trim($label.text());
            $label.hide();
          }

          // Modify the default text...
          if (typeof settings.callback === 'function') {
            defaultText = settings.callback(defaultText);
          }
          this.defaultText = defaultText;

          if ($label.length) {
            $label.text(this.defaultText);
          }

          if (_.$el.val()) {
            _.$el.addClass(settings.focus);
            return $(this);
          }
          else {
            this.default();
            _.$el.removeClass(settings.focus);
          }

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
            $(el)
            .val('')
            .removeClass(settings.default);
          }
        },

        unclear: function () {
          if (!this.value() && this.defaultText) {
            this.default();
          }
        },

        default: function () {
          $(el)
          .val(this.defaultText)
          .addClass(settings.default);
        }
      };

      instances.push(instance);
      instance.init();

      // Handlers
      $el
      .click(function () {
        $el.addClass(settings.focus);
        instance.clear();
      })
      .focus(function () {
        $el.addClass(settings.focus);
        instance.clear();
      })
      .hover(function () {
        $el.addClass(settings.hover);
      }, function () {
        $el.removeClass(settings.hover);
      })
      .blur(function () {
        $el
        .removeClass(settings.focus)
        .removeClass(settings.hover);
        instance.unclear();
      })
      .data('loftLabels', instance);
    });

    return this;
  };

  $.fn.loftLabels.defaults = {

    // The class to add to the textfield when it's in focus.
    "focus": "loft-labels-is-focus",

    // The class to add to the textfield when it's being hovered.
    "hover": "loft-labels-is-hover",

    // The class to add ot the textfield when it has default text.
    "default": "loft-labels-is-default",

    // a function that will receive the label string and return a
    // modified version of the label string. use this to alter the
    // label string before it's placed into the textfield.
    "callback": null,

    // A prefix for some css classes.  This is not added to focus, hover nor
    // default.
    "cssPrefix": 'loft-labels',

    // a function to call after init has completed.
    "onInit": null,

    // a function used to locate the label based on the input.
    "labelSelector": function ($el) {
      return $el.siblings('label').first();
    }
  };

  $.fn.loftLabels.version = function () {
    return '0.6.1';
  };

})(jQuery);
