/**
 * Loft Labels jQuery Plugin v1.0.0
 * http://www.intheloftstudios.com/packages/js/jquery.loft_labels
 *
 * jQuery plugin to move labels into the input element as placeholders with optional lightweight input validation.
 *
 * Copyright 2013-2018,
 * @license MIT
 *
 * Date: Fri Dec 14 16:36:16 PST 2018
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function(root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function($) {
  'use strict';
  var pluginName = 'loftLabels';
  $.fn.loftLabels = function(options) {
    this.settings = $.extend({}, $.fn.loftLabels.defaults, options);
    var $elements = $(this);

    // Do nothing when nothing selected
    if ($elements.length === 0) {
      return;
    }

    /**
     * Fire validation callbacks after examining the values of all group
     * instances.
     */
    var validationHandler = function(instance, event) {
      var settings = instance.settings;
      if (!settings.validation) {
        return;
      }
      var validCount = 0;

      // Cycle through all members to be validated.
      $members.each(function() {
        var $member = $(this),
          instance = $member.data(pluginName);
        // A member is not a member yet if it's not instantiated, this can be
        // the case on init.
        if (!instance) return;
        var value = $member.val(),
          isDefault = instance ? instance.isDefault() : true;
        if (!value || isDefault) {
          if (typeof settings.onNotValid === 'function') {
            settings.onNotValid.call(instance, value, event);
          }
        } else {
          validCount++;
          if (typeof settings.onValid === 'function') {
            settings.onValid.call(instance, value, event);
          }
        }
      });
      if (validCount === $members.length) {
        if (typeof settings.onAllValid === 'function') {
          settings.onAllValid.call(instance, event);
        }
      }
    };

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend({}, $.fn.loftLabels.defaults, options),
      $members = settings.validation === true ? $elements : settings.validation;

    $elements
      .not('.' + settings.cssPrefix + '-processed')
      .addClass(settings.cssPrefix + '-processed')
      .each(function() {
        // Setup: Move the label into the field
        var el = this,
          $el = $(this),
          validationTimeout;

        var instance = {
          el: el,
          $el: $el,
          $validation: $members,
          defaultText: null,
          settings: settings,
          states: [],

          /**
           * (Re-)Initialize the form element.
           */
          init: function() {
            var $label = settings.labelSelector.call(this, this.$el),
              defaultText = '',
              tagName = this.$el.get(0).tagName.toLowerCase();

            // Determine the default text from the label tag...
            if (tagName === 'textarea') {
              defaultText = this.$el.text();
            }

            if ($label.length) {
              defaultText = $.trim($label.text());
              $label.hide();
            }

            // Modify the default text...
            this.defaultText = settings.callback
              ? settings.callback.call(this, defaultText)
              : defaultText;

            if ($label.length) {
              $label.text(this.defaultText);
            }

            // If we have a value in the form, this plugin is moot.
            if (this.value()) {
              this.$el.addClass(settings.focus);
              return $(this);
            } else {
              this.default();
              this.$el.removeClass(settings.focus);
            }

            this.render();
            validationHandler(this, { type: 'init' });
            if (typeof settings.onInit === 'function') {
              settings.onInit(this);
            }

            return this;
          },

          /**
           * Get the current value.
           */
          value: function() {
            return $.trim($el.val());
          },

          /**
           * Determine if the current value is the default value.
           * @returns {boolean}
           */
          isDefault: function() {
            return this.value() === this.defaultText;
          },

          /**
           * Clear the value of the input, only if it is the default value.
           */
          clear: function() {
            if (this.isDefault()) {
              $el.val('');
              this.render();
            }
            return this;
          },

          unclear: function() {
            if (!this.value() && this.defaultText) {
              this.default();
            }
            return this;
          },

          /**
           * Set the value of the input to the default, overwriting current
           * value.
           */
          default: function() {
            if ($el.val() !== this.defaultText) {
              $el.val(this.defaultText);
              this.render();
            }
            return this;
          },

          /**
           * Update DOM with correct CSS classes.
           */
          render: function() {
            var add = [],
              remove = [];

            // Hover
            if (this.states.hover) {
              add.push(settings.hover);
            } else {
              remove.push(settings.hover);
            }

            // Focus
            if (this.states.focus) {
              add.push(settings.focus);
            } else {
              remove.push(settings.focus);
            }

            // Default
            if (this.isDefault()) {
              add.push(settings.default);
            } else {
              remove.push(settings.default);
            }

            // Now process the DOM.
            if (add) {
              this.$el.addClass(add.join(' '));
            }
            if (remove) {
              this.$el.removeClass(remove.join(' '));
            }
            return this;
          },
        };

        $el.data(pluginName, instance);
        instance.init();

        // Handlers
        $el
          .bind('focus', function() {
            instance.states.focus = true;
            instance.clear();
          })
          .bind('blur', function() {
            instance.states.focus = false;
            instance.unclear();
          })
          .hover(
            function() {
              instance.states.hover = true;
              instance.render();
            },
            function() {
              instance.states.hover = false;
              instance.render();
            }
          )
          .bind('keyup paste', function() {
            instance.render();
          })
          .bind(instance.settings.validationEvents, function(event) {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(function() {
              validationHandler(instance, event);
            }, settings.validationThrottle);
          })
          .data(pluginName, instance);
      });

    return this;
  };
  $.fn.loftLabels.version = function() {
    return '1.0.0';
  };
  $.fn.loftLabels.defaults = {
    // The class to add to the textfield when it's in focus.
    focus: 'loft-labels-is-focus',

    // The class to add to the textfield when it's being hovered.
    hover: 'loft-labels-is-hover',

    // The class to add ot the textfield when it has default text.
    default: 'loft-labels-is-default',

    // A prefix for some css classes.  This is not added to focus, hover nor
    // default.
    cssPrefix: 'loft-labels',

    /**
     * Modify the label string.
     *
     * Used this to alter the label string before it's placed into the
     * textfield. The instance is available as 'this'.
     *
     * @param defaultText
     * @returns {*}
     */
    callback: null,

    /**
     * A function to call after init has completed.
     *
     * $.fn.loftLabels is available as 'this'.
     *
     * @param instance
     */
    onInit: null,

    /**
     * Leave this false to disable the validation feature. Set this to true and
     * all elements must validate.  Set this to a jquery selector and only
     * those in this set must validate to fire onAllValid.
     *
     * @var bool|jQuery
     */
    validation: false,

    /**
     * These events on a given instance will trigger validation.
     */
    validationEvents: 'blur paste keyup',

    /**
     * Delay in milliseconds between event and validation.  This is helpful
     * when the input is coming from a robotyper to give the input time to fill
     * up with the automatic typing.
     */
    validationThrottle: 100,

    /**
     * Callback for when a all validation element become valid.
     *
     * @param object event The DOM event that triggered the final validation.
     *
     * The loftLabels instance for the element is available as this. Use
     *   this.$el to get the input element. All validation members are
     *   available as this.$validation
     *
     * @see validationEvents
     */
    onAllValid: null,

    /**
     * Callback for when a single validation element becomes valid.
     *
     * @param mixed value The current value of the input.
     * @param object event The DOM event that triggered validation.
     *
     * The loftLabels instance for the element is available as this.  Use
     *   this.$el to get the input element. All validation members are
     *   available as this.$validation
     *
     * @see validationEvents
     */
    onValid: null,

    /**
     * Callback for when a single validation element becomes invalid.
     *
     * @param mixed value The current value of the input.
     * @param object event The DOM event that triggered invalidation.
     *
     * The loftLabels instance for the element is available as this.  Use
     *   this.$el to get the input element. All validation members are
     *   available as this.$validation
     *
     * @see validationEvents
     */
    onNotValid: null,

    /**
     * Locate the label element.
     *
     * The instance is available as 'this'.
     *
     * @param $el
     */
    labelSelector: function($el) {
      var id = $el.attr('id'),
        $label = $('label[for=' + id + ']');
      if ($label.length) {
        return $label;
      }

      return $el.siblings('label').first();
    },
  };

  /**
   * Remove data from $el, which were added by this plugin.
   */
  $.fn.loftLabels.prototype.destroy = function() {
    this.$el.removeData(pluginName);
  };
});
