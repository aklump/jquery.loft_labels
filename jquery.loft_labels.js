/**
 * Loft Labels jQuery JavaScript Plugin v0.7.7
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013-2017,
 * @license [name]Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Tue Aug  1 14:17:58 PDT 2017
 */
/**
 * Example for responsive support:
 * @code
 *   $('#name').loftLabels({
 *     breakpointX          : new BreakpointX({mobile: 0, desktop: 768}),
 *     breakpointDefaultText: function (alias, minMax, bp) {
 *       return alias === 'mobile' ? 'Name' : 'Enter your first name';
 *     }
 *   });
 * @endcode
 *
 * Example for validation
 * @code
 *   var $submit = $('.form-submit'),
 *       id      = $('form').attr('id');
 *   $('#name').loftLabels({
 *     validation: true,
 *     onValid        : function ($member, value) {
 *       if (value === 'Aaron') {
 *         $submit.click();
 *       }
 *     }
 *   });
 * @endcode
 *
 * VALIDATION
 *
 * - Be careful that if you have more than one form, and you want the fields of each form to validate independently of
 *   each other, that you process each form to loftLabels separately.  Otherwise if you set validation to true, the
 *   onAllValid will only fire when all form inputs of all forms are valid.
 */
;(function ($) {
  "use strict";

  /**
   * Store all instances on the current page in a global var.
   * @type {Array}
   */
  $.fn.loftLabels = function (options) {
    var $elements = $(this);

    // Do nothing when nothing selected
    if ($elements.length === 0) {
      return;
    }

    /**
     * Fire validation callbacks after examining the values of all group instances.
     */
    var validationHandler = function (instance, event) {
      var settings = instance.settings;
      if (settings.validation) {
        var allValid = true;

        // Cycle through all members to be validated.
        $members.each(function () {
          var $member   = $(this),
              instance  = $member.data('loftLabels'),
              value     = $member.val(),
              isDefault = instance ? instance.isDefault() : true;

          if (!value || isDefault) {
            if (settings.onNotValid) {
              settings.onNotValid.call(instance, $member, isDefault, value, event);
            }
            allValid = false;
          }
          else {
            if (settings.onValid) {
              settings.onValid.call(instance, $member, value, event);
            }
          }
        });
        if (allValid) {
          if (settings.onAllValid) {
            settings.onAllValid.call(instance, event);
          }
        }
      }
    };

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend({}, $.fn.loftLabels.defaults, options),
        $members = settings.validation === true ? $elements : settings.validation;

    $elements.not('.' + settings.cssPrefix + '-processed')
    .addClass(settings.cssPrefix + '-processed')
    .each(function () {
      // Setup: Move the label into the field
      var el  = this,
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
        init: function () {
          var $label      = settings.labelSelector.call(this, this.$el),
              defaultText = '',
              tagName     = this.$el.get(0).tagName.toLowerCase(),
              self        = this;

          // Determine the default text from the label tag...
          if (tagName === 'textarea') {
            defaultText = this.$el.text();
          }

          if ($label.length) {
            defaultText = $.trim($label.text());
            $label.hide();
          }

          // Setup the breakpoints if necessary
          if (settings.breakpointX && settings.breakpointDefaultText) {
            defaultText = settings.breakpointDefaultText.call(
              self,
              settings.breakpointX.current,
              settings.breakpointX.value(settings.breakpointX.current),
              settings.breakpointX
            );
            settings.breakpointX.add('both', settings.breakpointX.aliases, function (from, to) {
              self.clear();
              self.defaultText = settings.breakpointDefaultText.call(
                self,
                to.name,
                settings.breakpointX.value(to.name),
                settings.breakpointX
              );
              self.unclear();
            });
          }

          // Modify the default text...
          this.defaultText = settings.callback ? settings.callback.call(this, defaultText) : defaultText;

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
          validationHandler(this, {type: 'init'});
          if (settings.onInit) {
            settings.onInit(this);
          }

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
          }
          return this;
        },

        unclear: function () {
          if (!this.value() && this.defaultText) {
            this.default();
          }
          return this;
        },

        /**
         * Set the value of the input to the default, overwriting current value.
         */
        default: function () {
          if ($el.val() !== this.defaultText) {
            $el.val(this.defaultText);
            this.render();
          }
          return this;
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
          return this;
        }
      };

      $el.data('loftLabels', instance);
      instance.init();

      // Handlers
      $el
      .bind('focus', function () {
        instance.states.focus = true;
        instance.clear();
      })
      .bind('blur', function () {
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
      .bind('keyup paste', function () {
        instance.render();
      })
      .bind(instance.settings.validationEvents, function (event) {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(function () {
          validationHandler(instance, event);
        }, settings.validationThrottle);
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
     * Modify the label string.
     *
     * Used this to alter the label string before it's placed into the textfield.
     * The instance is available as 'this'.
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
     * To turn on validation of the elements being processed, set this to true.  If validation should happen on a
     * different set of elements than those provided as the subject of this instance then, you can also provide a
     * jQuery object with a group of members, all of which must validate for onValid to fire.
     */
    validation: false,

    /**
     * These events on a given instance will trigger validation.
     */
    validationEvents: 'blur paste keyup',

    /**
     * Delay in milliseconds between event and validation.  This is helpful when the input is coming from a robotyper
     * to give the input time to fill up with the automatic typing.
     */
    validationThrottle: 100,

    /**
     * Callback for when a all validation element become valid.
     *
     * @param object event The DOM event that triggered the final validation.
     *
     * The loftLabels instance for the element is available as this
     * All validation members are available as this.$validation
     *
     * @see validationEvents
     */
    onAllValid: null,

    /**
     * Callback for when a single validation element becomes valid.
     *
     * @param jQuery $member The input element.
     * @param mixed value The current value of the input.
     * @param object event The DOM event that triggered validation.
     *
     * The loftLabels instance for the element is available as this
     * All validation members are available as this.$validation
     *
     * @see validationEvents
     */
    onValid: null,

    /**
     * Callback for when a single validation element becomes invalid.
     *
     * @param jQuery $member The input element.
     * @param bool isDefault True only if the value is the default value.
     * @param mixed value The current value of the input.
     * @param object event The DOM event that triggered invalidation.
     *
     * The loftLabels instance for the element is available as this
     * All validation members are available as this.$validation
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
    labelSelector: function ($el) {
      return $el.siblings('label').first();
    },

    /**
     * Pass in a BreakpointX instance to use for responsive support.
     *
     * @link http://www.intheloftstudios.com/packages/js/breakpointX
     */
    breakpointX: null,

    /**
     * A callback for default text per breakpoint.  It receives the current breakpoint alias name as the first
     * argument, an array of min/max widths of the current breakpoint, and the BreakpointX object as the last.  This
     * points to the LoftLabels instance. This does nothing unless breakpointX is passed.
     */
    breakpointDefaultText: null

  };

  $.fn.loftLabels.version = function () {
    return '0.7.7';
  };

})(jQuery);
