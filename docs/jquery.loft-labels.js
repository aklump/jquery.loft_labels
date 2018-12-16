/**
 * Loft Labels jQuery Plugin v1.1.6
 * http://www.intheloftstudios.com/packages/js/jquery.loft_labels
 *
 * jQuery plugin to move labels into the input element as placeholders with optional lightweight input validation.
 *
 * Copyright 2013-2018,
 * @license MIT
 *
 * Date: Sun Dec 16 13:35:40 PST 2018
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

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend({}, $.fn.loftLabels.defaults, options),
      $members = settings.validation === true ? $elements : settings.validation;

    $elements
      .not('.' + settings.cssPrefix + '-processed')
      .addClass(settings.cssPrefix + '-processed')
      .each(function() {
        // Setup: Move the label into the field
        var $el = $(this),
          validationTimeout;

        var instance = {
          $el: $el,
          $validation: $members,
          // This is the fallback label.
          defaultText: null,
          label: null,
          settings: settings,
          segment: {},
          hasDefaultText: true,
          states: [],

          /**
           * Set the value of the input field.
           *
           * Use this instead of the jQuery .val() method as it handles extra
           * work for you.
           *
           * @param value
           */
          setValue: function(value) {
            this.$el.val(value).keyup();
            renderHtml.call(this);
            return this;
          },

          /**
           * Get the value of the input field with whitespace trimmed.
           * @returns {string}
           */
          getValue: function() {
            return $.trim(this.$el.val());
          },

          /**
           * Return the label based on the current context.
           *
           * If using BreakpointX the label is based on segment.
           *
           * @returns {null}
           */
          getLabel: function() {
            this.label = this.defaultText;
            if (this.segment) {
              var name = 'data-' + this.settings.dataPrefix + this.segment.name;
              this.label = this.$label.attr(name) || this.label;
            }
            if (typeof this.settings.onGetLabel === 'function') {
              this.label = this.settings.onGetLabel.call(this, this.label);
            }

            return this.label;
          },
        };

        $el.data(pluginName, instance);
        initializeInstance.call(instance);

        // Handlers
        $el
          .bind('focus', function() {
            instance.hasDefaultText || detectDefaultState(instance);
            instance.states.focus = true;
            if (instance.hasDefaultText) {
              $el.val('');
              renderHtml.call(instance);
            }
          })
          .bind('blur', function() {
            detectDefaultState(instance);
            instance.states.focus = false;
            refreshInstance(instance);
          })
          .hover(
            function() {
              instance.states.hover = true;
              renderHtml.call(instance);
            },
            function() {
              instance.states.hover = false;
              renderHtml.call(instance);
            }
          )
          .bind('keyup paste', function() {
            detectDefaultState(instance);
            if (instance.value) renderHtml.call(instance);
          })
          .bind(instance.settings.validationEvents, function(event) {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(function() {
              validationHandler(instance, event, $members);
            }, settings.validationThrottle);
          })
          .data(pluginName, instance);
      });

    if (this.settings.breakpointX) {
      this.settings.breakpointX.addCrossAction(function(segment) {
        // Read in the segment label for all elements.
        $elements.each(function() {
          var instance = $(this).data('loftLabels');
          instance.segment = segment;
          refreshInstance(instance);
        });
      });
    }

    return this;
  };
  $.fn.loftLabels.version = function() {
    return '1.1.6';
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
     * A prefix to use for data elements, e.g. "data-{prefix}"
     *
     * This is used for reponsive support.
     *
     * @var string
     */
    dataPrefix: 'label-',

    /**
     * For responsive support pass a BreakpointX instance.
     *
     * @link https://github.com/aklump/breakpointX
     *
     * @var BreakpointX
     */
    breakpointX: null,

    /**
     * Preset the default segement instead of using window.width.
     *
     * By default the segment at instantiation is based on the window width.
     * You may pass a segment here to use instead.  This may only be necessary
     * for unti testing.
     */
    segment: null,

    /**
     * Modify the label string.
     *
     * Use this to alter the label string before getLabel().
     *
     * @param {string} label
     *   The label as it's been figured.
     *
     * @returns {*}
     *   The (altered) label to use.
     */
    onGetLabel: null,

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

  function detectDefaultState(instance) {
    var value = instance.getValue();
    instance.hasDefaultText = !value || value === instance.label;
  }

  function initializeInstance() {
    var s = this.settings;
    var tagName = this.$el.get(0).tagName.toLowerCase();
    this.$label = s.labelSelector.call(this, this.$el);

    // Determine the default text from the markup.
    if (tagName === 'textarea') {
      this.defaultText = this.$el.text();
    }
    if (this.$label.length) {
      this.defaultText = this.$label.text();
      this.$label.hide();
    }

    // Modify the default text...
    this.defaultText = $.trim(this.defaultText);
    this.label = $.trim(this.defaultText);

    // If we have a value in the form, this plugin is moot.
    this.hasDefaultText = false;
    if (!this.getValue()) {
      this.hasDefaultText = true;
      if (s.breakpointX) {
        this.segment = s.segment || s.breakpointX.getSegmentByWindow();
      }
      // Due to complex reasons; do not use setValue() here! 2018-12-15T13:27,
      // aklump
      this.$el.val(this.getLabel());
      this.$el.removeClass(s.focus);
    }
    renderHtml.call(this);
    validationHandler(this, { type: 'init' }, this.$validation);
    if (typeof s.onInit === 'function') {
      s.onInit(this);
    }
    return this;
  }

  /**
   * Fire validation callbacks after examining the values of all group
   * instances.
   */
  var validationHandler = function(instance, event, $members) {
    var settings = instance.settings;
    if (!settings.validation) return;
    var validCount = 0;

    // Cycle through all members to be validated.
    $members.each(function() {
      var $member = $(this),
        instance = $member.data(pluginName);
      // A member is not a member yet if it's not instantiated, this can be
      // the case on init.
      if (!instance) return;
      var value = $member.val();
      if (!value || value === instance.label) {
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

  /**
   * If displaying default text, make sure it's correct.
   */
  function refreshInstance(instance) {
    if (instance.hasDefaultText) {
      instance.$el.val(instance.getLabel());
      renderHtml.call(instance);
      return this;
    }
  }

  /**
   * Update DOM with correct CSS classes.
   */
  function renderHtml() {
    var add = [],
      remove = [],
      s = this.settings;
    if (this.states.hover) {
      add.push(s.hover);
    } else {
      remove.push(s.hover);
    }
    if (this.states.focus) {
      add.push(s.focus);
    } else {
      remove.push(s.focus);
    }
    if (this.getValue() === this.label) {
      add.push(s.default);
    } else {
      remove.push(s.default);
    }
    if (add) {
      this.$el.addClass(add.join(' '));
    }
    if (remove) {
      this.$el.removeClass(remove.join(' '));
    }
    return this;
  }
});
