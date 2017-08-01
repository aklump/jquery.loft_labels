# Changelog

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

