# Changelog

## 1.0
* Major change of instanct properties.
* `settings.callback` became `settings.onGetLabel` and now fires every time, not just instantiation.
* Changed the function arguments to `onNotValid`, removed `$member` and `isDefault`. 
* Added label location matching `for` to `id`.  The initial search is now for a label having a `for` attribute that matches the id of the input.  The old way is used as a fallback if the first is not found.  If this breaks you should use this as your instantion setting, which is the old function.

        $('input').loftLabels({
          labelSelector: function($el) {
            return $el.siblings('label').first();
          }
        });

## 0.8 BREAKING CHANGE

Refactored validation: 
- you will need to convert `validationGroup` per the new api for validation.  See plugin or demo for more info.
- you probably will need to rename your `onValid` to `onAllValid`; but learn about the new `onAllValid` vs. `onValid` callbacks introduced.
- callback arguments have changed for `onValid` and `onNotValid`.

## 0.7

Removed legacy support for passing an array of instances in the constructor.  The following code will no longer work:

    var instances = [];
    $('#search').loftLabels({
      callback: function() {
        return 'Type to search...'
      }
    }, instances);
    var instance = instances[0];

