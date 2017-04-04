/**
 * Loft Labels jQuery JavaScript Plugin v0.7.4
 * http://www.intheloftstudios.com/packages/jquery/jquery.loft_labels
 *
 * jQuery plugin to move textfield labels into the input element itself as the default values.
 *
 * Copyright 2013-2017,
 * @license [name]Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Tue Apr  4 11:31:17 PDT 2017
 */
/**
 * Example for responsive support:
 * @code
 *   $('#name').loftLabels({
 *     breakpointX          : new BreakpointX({mobile: 0, desktop: 768}),
 *     breakpointDefaultText: function (alias, bp) {
 *       return alias === 'mobile' ? 'Name' : 'Enter your first name';
 *     }
 *   });
 * @endcode
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
     * Fire validation callbacks after examining the values of all group instances.
     */
    var validationHandler = function (instance, event) {
      var settings = instance.settings;
      if (settings.validationGroup) {
        var groupInstances = $.loftLabels.instances[settings.validationGroup],
            allValid       = true;
        for (var i in groupInstances) {
          if (!groupInstances[i].value() || groupInstances[i].isDefault()) {
            allValid = false;
            break;
          }
        }
        if (allValid) {
          settings.onValid.call(instance, event, groupInstances);
        }
        else {
          settings.onNotValid.call(instance, event, groupInstances);
        }
      }
    };

    // Do nothing when nothing selected
    if ($elements.length === 0) {
      return;
    }

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend({}, $.fn.loftLabels.defaults, options),
        groupId  = settings.validationGroup || 'global';

    $.loftLabels.instances[groupId] = $.loftLabels.instances[groupId] || [];

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
              tagName     = this.$el.get(0).tagName.toLowerCase(),
              self        = this;

          // Setup the breakpoints if necessary
          if (settings.breakpointX && settings.breakpointDefaultText) {
            var breakpointHandler = function (from, to) {
              self.clear();
              self.defaultText = settings.breakpointDefaultText.call(self, to.name);
              self.unclear();
            };
            settings.breakpointX.add('both', settings.breakpointX.aliases, breakpointHandler)
            breakpointHandler(null, {name: settings.breakpointX.current});
          }

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
          validationHandler(this, {type: 'init'});
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
      $.loftLabels.instances[groupId].push(instance);
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
        validationHandler(instance, event);
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
     * To turn on validation, you need to set a validationGroup.  All instances of the same group will be used for
     * validation.  This would mostly likely be all or some inputs of a single form.  You can use the id of a form, for
     * example.
     */
    validationGroup: null,

    /**
     * These events on a given instance will trigger validation, if validationGroup is set. e.g. blur paste keyup
     */
    validationEvents: 'blur paste keyup',

    /**
     * Callback for when all group instances have valid values (not '' nor default)
     *
     * @param groupInstances
     *
     * @see validationEvents
     * @see validationGroup
     */
    onValid: function (groupInstances) {
    },

    /**
     * Callback for when all group instances have valid values (not '' nor default)
     *
     * @param groupInstances
     *
     * @see validationEvents
     * @see validationGroup
     */
    onNotValid: function (groupInstances) {
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
    },

    /**
     * Pass in a BreakpointX instance to use for responsive support.
     *
     * @link http://www.intheloftstudios.com/packages/js/breakpointX
     */
    breakpointX: null,

    /**
     * A callback for default text per breakpoint.  It receives the current breakpoint alias name as the first
     * argument, and the BreakpointX object as the seconds.  this points to the LoftLabels instance. This does nothing
     * unless breakpointX is passed.
     */
    breakpointDefaultText: null

  };

  $.fn.loftLabels.version = function () {
    return '0.7.4';
  };

})(jQuery);
