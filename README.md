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

## Form validation
In many cases, you would not want to submit a form that has the default value of the input as it's value.  You can leverage the `onChange` callback for a client-side form validation function, like the following example illustrates.  Simply monitor the value of the input and disable/enable the submit button as appropriate.

    var $submit = $('#form1 submit');
    $('#form1 input').loftLabels({
      onChange: function (value, isDefault, instances) {
        if (!value || isDefault) {
          $submit.attr('disabled', 'disabled');
        }
        else {
          $submit.attr('disabled', '');
        }
      },
    });

For forms that use more than on input you can review the `instances` and validate the submit key based on all instance values.  Take a look at `demo/index.html` for an example of this.

## Capture the instance for later manipulation

    var instance = $('#search').loftLabels({
      callback: function () {
        return 'Type to search...'
      }
    })
    .data('loftLabels');
    
    // instance.el
    // instance.$el
    // instance.defaultText
    // instance.settings

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
