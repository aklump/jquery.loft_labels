## Usage

For a given form element with a label in the following structure:

    <form>
      <label for="search">Type to search</label>
      <input type="text" id="search" name="search" value=""/>
    </form>

You would use this jQuery code to make this plugin work:

    $('form').loftLabels();

See the plugin file for options to pass.


## Install with bower

    bower install loft_labels