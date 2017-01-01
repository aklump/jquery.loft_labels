/**
 * Loft Labels jQuery JavaScript Plugin v0.7.2
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013-2017, 
 * @license [name]Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Sun Jan  1 13:08:13 PST 2017
 */
;(function ($) {
  "use strict";

  /**
   * Store all instances on the current page in a global var.
   * @type {Array}
   */
  $.loftLabels = {
    instances: []
  };

  $.fn.loftLabels = function (options) {
    var $elements = $(this);

    /**
     * Call settings.onChange with necessary arguments.
     *
     * @param instance
     * @param value
     * @param isDefault
     */
    var changeHandler = function (instance, value, isDefault) {
      settings.onChange.call(instance, value, isDefault, $.loftLabels.instances[settings.groupId]);
    };

    // Do nothing when nothing selected
    if ($elements.length === 0) {
      return;
    }

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend({}, $.fn.loftLabels.defaults, options);

    $.loftLabels.instances[settings.groupId] = $.loftLabels.instances[settings.groupId] || [];

    $elements.not('.' + settings.cssPrefix + '-processed')
    .addClass(settings.cssPrefix + '-processed')
    .each(function () {
      // Setup: Move the label into the field
      var el  = this,
          $el = $(this);

      var instance = {
        el         : el,
        $el        : $el,
        defaultText: null,
        settings   : settings,
        states     : [],

        /**
         * (Re-)Initialize the form element.
         */
        init: function () {
          var $label      = settings.labelSelector.call(this, this.$el),
              defaultText = '',
              tagName     = this.$el.get(0).tagName.toLowerCase();

          // Determine the default text from the label tag...
          if (tagName === 'textarea') {
            defaultText = this.$el.text();
          }

          if ($label.length) {
            defaultText = $.trim($label.text());
            $label.hide();
          }

          // Modify the default text...
          defaultText = settings.callback.call(this, defaultText);
          this.defaultText = defaultText;

          if ($label.length) {
            $label.text(this.defaultText);
          }

          // If we have a value in the form, this plugin is moot.
          if (this.value()) {
            this.$el.addClass(settings.focus);
            return $(this);
          }
          else {
            this.default();
            this.$el.removeClass(settings.focus);
          }

          this.render();
          settings.onInit(this);

          return this;
        },

        /**
         * Get the current value.
         */
        value: function () {
          return $.trim($el.val());
        },

        /**
         * Determine if the current value is the default value.
         * @returns {boolean}
         */
        isDefault: function () {
          return this.value() === this.defaultText;
        },

        /**
         * Clear the value of the input, only if it is the default value.
         */
        clear: function () {
          if (this.isDefault()) {
            $el.val('');
            this.render();
            changeHandler(this, '', false);
          }
        },

        unclear: function () {
          if (!this.value() && this.defaultText) {
            this.default();
          }
        },

        /**
         * Set the value of the input to the default, overwriting current value.
         */
        default: function () {
          $el.val(this.defaultText);
          this.render();
          changeHandler(this, this.defaultText, true);
        },


        /**
         * Update DOM with correct CSS classes.
         */
        render: function () {
          var add    = [],
              remove = [];

          // Hover
          if (this.states.hover) {
            add.push(settings.hover);
          }
          else {
            remove.push(settings.hover);
          }

          // Focus
          if (this.states.focus) {
            add.push(settings.focus);
          }
          else {
            remove.push(settings.focus);
          }

          // Default
          if (this.isDefault()) {
            add.push(settings.default);
          }
          else {
            remove.push(settings.default);
          }

          // Now process the DOM.
          if (add) {
            this.$el.addClass(add.join(' '));
          }
          if (remove) {
            this.$el.removeClass(remove.join(' '));
          }
        }
      };

      // This must come before init()!
      $.loftLabels.instances[settings.groupId].push(instance);
      instance.init();

      // Handlers
      $el
      .bind('focus', function () {
        instance.states.focus = true;
        instance.clear();
      })
      .blur(function () {
        instance.states.focus = false;
        instance.unclear();
      })
      .hover(function () {
        instance.states.hover = true;
        instance.render();
      }, function () {
        instance.states.hover = false;
        instance.render();
      })
      .keyup(function () {
        instance.render();
        changeHandler(instance, instance.value(), instance.isDefault());
      })
      .data('loftLabels', instance);
    });

    return this;
  };
  $.fn.loftLabels.defaults = {

    // The class to add to the textfield when it's in focus.
    focus: "loft-labels-is-focus",

    // The class to add to the textfield when it's being hovered.
    hover: "loft-labels-is-hover",

    // The class to add ot the textfield when it has default text.
    default: "loft-labels-is-default",

    // A prefix for some css classes.  This is not added to focus, hover nor
    // default.
    cssPrefix: 'loft-labels',

    /**
     * You may group instances by groupId to affect the value of instances in the callbacks.  You would use this to
     * group by form, for example.
     */
    groupId: 'global',

    /**
     * Modify the label string.
     *
     * Used this to alter the label string before it's placed into the textfield.
     * The instance is available as 'this'.
     *
     * @param defaultText
     * @returns {*}
     */
    callback: function (defaultText) {
      return defaultText;
    },

    /**
     * A function to call after init has completed.
     *
     * $.fn.loftLabels is available as 'this'.
     *
     * @param instance
     */
    onInit: function (instance) {
    },

    /**
     * React to the changing value of the the input.
     *
     * The instance is available as 'this'.
     *
     * @param mixed value The current value of the input.
     * @param bool isDefault If the current value is the default value.
     * @param array groupInstances All instances with the same groupId will be passed here.  Can be used for validating
     *   entire forms.
     */
    onChange: function (value, isDefault, groupInstances) {

    },

    /**
     * Locate the label element.
     *
     * The instance is available as 'this'.
     *
     * @param $el
     */
    labelSelector: function ($el) {
      return $el.siblings('label').first();
    }
  };

  $.fn.loftLabels.version = function () {
    return '0.7.2';
  };

})(jQuery);
