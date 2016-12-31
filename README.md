## Usage

For a given form element with a label in the following structure:

    <form>
      <label for="search">Type to search...</label>
      <input type="text" id="search" name="search" value=""/>
    </form>

You would use this jQuery code to make this plugin work:

    $('form input').loftLabels();

See the plugin file for options to pass.

## Usage without a `<label>`

    <form>
      <input type="text" id="search" name="search" value=""/>
    </form>

You would use this jQuery code:

    $('#search').loftLabels({
      callback: function() {
        return 'Type to search...'
      }
    });

## Simple form validation

We can enable/disable the submit button based on the default value of the input using the callbacks: `onDefault` and `onNotDefault`.

    var $submit = $('#form1 submit')
    $('#form1 input').loftLabels({
      onDefault   : function () {
        $submit.attr('disabled', 'disabled');
      },
      onNotDefault: function () {
        $submit.attr('disabled', '');
      }
    });

## Capture the instance for later manipulation

    var instance = $('#search')
    .loftLabels({
      callback: function () {
        return 'Type to search...'
      }
    })
    .data('loftLabels');
    
    // instance.el
    // instance.$el
    // instance.defaultText
    // instance.settings
    
    --- OR THE LEGACY CODE IS...
    
    var instances = [];
    $('#search').loftLabels({
      callback: function() {
        return 'Type to search...'
      }
    }, instances);
    var instance = instances[0];

    ...

    // Call the intializer later on if desired...
    instance.init();

    // Get the value of the input...
    var value = instance.value();

    // Clear the field if the value is the default...
    instance.clear();

    // Restore the field to default if empty...
    instance.unclear();

    // Overwrite the field with the default...
    instance.default();

## Install with bower

    bower install loft_labels
