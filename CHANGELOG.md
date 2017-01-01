# Changelog

## 0.7
Removed legacy support for passing an array of instances in the constructor.  The following code will no longer work:

    var instances = [];
    $('#search').loftLabels({
      callback: function() {
        return 'Type to search...'
      }
    }, instances);
    var instance = instances[0];

