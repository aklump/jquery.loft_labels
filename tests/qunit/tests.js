/**
 * @file
 * Tests provided against the LoftLabels class.
 *
 * @ingroup loft_labels
 * @{
 */

QUnit.test('Label with value is not affected by change of segment',
  function(assert) {
    $('#qunit-fixture').html(markupResponsive);
    var bpx = new BreakpointX([480, 768], ['small', 'medium', 'large']);
    var instance = $('#responsive-demo')
      .loftLabels({ breakpointX: bpx })
      .data('loftLabels');
    instance.setValue('Sunrise');
    bpx.triggerActions(300);
    assert.strictEqual(instance.getValue(), 'Sunrise');
    assert.strictEqual(instance.getLabel(), 'Small label');

    bpx.onWindowResize(500);
    assert.strictEqual(instance.getValue(), 'Sunrise');
    assert.strictEqual(instance.getLabel(), 'Medium label');

    bpx.onWindowResize(1000);
    assert.strictEqual(instance.getValue(), 'Sunrise');
    assert.strictEqual(instance.getLabel(), 'Large label');
  });

QUnit.test('GetLabels works as expected', function(assert) {
  $('#qunit-fixture').html(markup);
  var $el = $('#search');
  var instance = $el.loftLabels().data('loftLabels');
  assert.strictEqual(instance.getLabel(), 'Type to search...');
  assert.strictEqual($el.val(), 'Type to search...');
  instance.setValue('blue trousers');
  assert.strictEqual($el.val(), 'blue trousers');
  assert.strictEqual(instance.getLabel(), 'Type to search...');
});

QUnit.test('SetValue works as expected', function(assert) {
  $('#qunit-fixture').html(markup);
  var $el = $('#search');
  var instance = $el.loftLabels().data('loftLabels');
  assert.strictEqual($el.val(), 'Type to search...');
  assert.ok($el.hasClass('loft-labels-is-default'));
  instance.setValue('Search...').getValue();
  assert.strictEqual($el.val(), 'Search...');
  assert.notOk($el.hasClass('loft-labels-is-default'));
});

QUnit.test('GetValue works as expected and trims whitespace', function(assert) {
  $('#qunit-fixture').html(markup);
  var $el = $('#search');
  var instance = $el.loftLabels().data('loftLabels');
  instance.setValue('    my value     ');
  assert.strictEqual(instance.getValue(), 'my value');
});

QUnit.test('Default Label changes for each breakpoint', function(assert) {
  $('#qunit-fixture').html(markupResponsive);
  var bpx = new BreakpointX([480, 768], ['small', 'medium', 'large']);
  var instance = $('#responsive-demo').loftLabels({
    breakpointX: bpx,
  }).data('loftLabels');
  bpx.triggerActions(300);
  assert.strictEqual(instance.getValue(), 'Small label');
  bpx.onWindowResize(500);
  assert.strictEqual(instance.getValue(), 'Medium label');
  bpx.onWindowResize(1000);
  assert.strictEqual(instance.getValue(), 'Large label');
});

QUnit.test('Assert default value clears on focus, does not return when blur has value.', function(assert) {
  $('#qunit-fixture').html(markupFormWithThreeInputs);
  var $input = $('[name=do]');
  $input.loftLabels();
  assert.strictEqual($input.val(), 'do');
  assert.strictEqual($input.focus().val(), '');
  assert.strictEqual($input.val('waffle').blur().val(), 'waffle');
});

QUnit.test('Assert default value clears on focus, returns on blur when empty', function(assert) {
  $('#qunit-fixture').html(markupFormWithThreeInputs);
  var $input = $('[name=do]');
  $input.loftLabels();
  assert.strictEqual($input.val(), 'do');
  assert.strictEqual($input.focus().val(), '');
  assert.strictEqual($input.blur().val(), 'do');
});

QUnit.test('Assert onAllValid fires when validation is a jQuery object of lesser scope on keyup.', function(assert) {
  $('#qunit-fixture').html(markupScopeForm);
  var $form = $('#testcase');
  var onValidCalled = assert.async(1);
  $form.find('input').loftLabels({
    validation: $form.find('input:not(#phone)'),
    onAllValid: function(event) {
      assert.ok(event.type);
      onValidCalled();
    }
  });
  $('#name, #email').val('lorem');
  $('#name').keyup();
});

QUnit.test('Assert onAllValid receives correct arguments on blur', function(assert) {
  $('#qunit-fixture').html(markupExample2);
  var $form = $('#testcase'),
    $input = $form.find('input'),
    $textarea = $form.find('textarea');
  var onAllValid = assert.async(1);
  $textarea.add($input)
    .loftLabels({
      validation: true,
      onAllValid: function(event) {
        assert.strictEqual(event.type, 'blur');
        assert.ok(this.$el.filter('#comment').length === 1);
        assert.ok(this.$validation.length === 2);
        onAllValid();
      }
    });
  $textarea
    .add($input)
    .val('lorem');
  $textarea.blur();
});

QUnit.test('Assert onNotValid receives correct arguments on blur', function(assert) {
  $('#qunit-fixture').html(markupExample2);
  var $form = $('#testcase'),
    $textarea = $form.find('textarea'),
    onNotValidCalled = assert.async(1);
  $textarea
    .loftLabels({
      validation: true,
      onNotValid: function(value, event) {
        if (event.type === 'init') return;
        assert.strictEqual(this.$el.filter('#comment').length, 1);
        assert.strictEqual(value, 'Share your thoughts...');
        assert.strictEqual(event.type, 'blur');
        onNotValidCalled();
      }
    });
  $textarea
    .blur();
});

QUnit.test('Assert onValid receives correct arguments on blur', function(assert) {
  $('#qunit-fixture').html(markupExample2);
  var $form = $('#testcase'),
    $input = $form.find('input'),
    onValidCalled = assert.async(1);
  $input
    .loftLabels({
      validation: true,
      onValid: function(value, event) {
        assert.strictEqual(this.$el.filter('#name').length, 1);
        assert.strictEqual(value, 'Rabbit Air');
        assert.strictEqual(event.type, 'blur');
        onValidCalled();
      },
    });
  $input
    .val('Rabbit Air')
    .blur();
});

QUnit.test('Assert onAllValid fires once for each element when all inputs have a non-default value.', function(assert) {
  $('#qunit-fixture').html(markupFormWithThreeInputs);
  var $do = $('[name=do]');
  var $re = $('[name=re]');
  var $mi = $('[name=mi]');

  // It should fire once for each element.
  var isCalled = assert.async(3),
    isCalledWithDo = assert.async(1),
    isCalledWithRe = assert.async(1),
    isCalledWithMi = assert.async(1);
  $('#testcase input').loftLabels({
    validation: true,
    onAllValid: function() {
      isCalled();
      this.$el.filter('#do').length && isCalledWithDo();
      this.$el.filter('#re').length && isCalledWithRe();
      this.$el.filter('#mi').length && isCalledWithMi();
    }
  });

  // Click around.
  $do.blur();
  $re.blur();
  $mi.blur();

  // Give a non-default value to the first.
  $do.val('dog').blur();
  assert.strictEqual('dog', $do.val());

  // Click around.
  $do.blur();
  $re.blur();
  $mi.blur();
  $re.val('rabbit').blur();
  assert.strictEqual('rabbit', $re.val());

  $do.blur();
  $re.blur();
  $mi.blur();

  $mi.val('mouse').blur();
  assert.strictEqual('mouse', $mi.val());
});

QUnit.test('Assert labels are found by id when no siblings are present', function(assert) {
  $('#qunit-fixture').html(markupFormWithThreeInputs);
  var $do = $('[name=do]');
  var $re = $('[name=re]');
  var $mi = $('[name=mi]');

  $('#testcase input').loftLabels();
  assert.strictEqual('do', $do.val());
  assert.strictEqual('re', $re.val());
  assert.strictEqual('mi', $mi.val());
});

QUnit.test('Is processed class is applied.', function(assert) {
  $('#qunit-fixture').html(markupWithoutLabel);
  var $el = $('#first_name');
  assert.ok($el.loftLabels().hasClass('loft-labels-processed'));
});

QUnit.test('Assert labelSelector works to locate the label and hides the alternate label and sets the value of input.', function(assert) {
  $('#qunit-fixture').html(markupWithoutLabel);
  var $el = $('#first_name');
  labelSelectorIsCalled = assert.async();
  $el.loftLabels({
    labelSelector: function($el) {
      assert.strictEqual(this.$el.attr('id'), 'first_name');
      assert.strictEqual($el.attr('id'), 'first_name');
      labelSelectorIsCalled();
      var $label = $('.is-label');
      return $label;
    }
  });
  assert.strictEqual($el.val(), 'First name');
  assert.ok($('.is-label').is(':hidden'));
});


QUnit.test('Test instance.defaultText for textarea.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase textarea');
  assert.strictEqual(
    'Share your thoughts...',
    $el.loftLabels().data('loftLabels').defaultText
  );
});

QUnit.test('Test instance.defaultText for textfield.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  assert.strictEqual(
    'Type to search...',
    $el.loftLabels().data('loftLabels').defaultText
  );
});
QUnit.test(
  'Test the instance is available at the $el.data(\'loftLabels\')',
  function(assert) {
    $('#qunit-fixture').append(markup);
    var $el = $('#testcase input');
    $el.loftLabels();
    assert.ok($el.data('loftLabels'));
  }
);

QUnit.test('Test when input has no id.', function(assert) {
  $('#qunit-fixture').append(markup);
  var control = $('#testcase label').text();
  var done = assert.async();
  var $el = $('#testcase input');
  $el.removeAttr('id');
  assert.ok(!$el.attr('id'));

  $el.loftLabels({
    onInit: function() {
      assert.strictEqual($el.val(), control);
      done();
    },
  });
});

QUnit.test('Test the is-default class is applied/removed.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  $el.loftLabels();

  assert.ok($el.hasClass('loft-labels-is-default'));

  $el.focus().val('not the default');
  assert.ok(!$el.hasClass('loft-labels-is-default'));

  $el.val('').blur();
  assert.ok($el.hasClass('loft-labels-is-default'));
});

QUnit.test('Test instance.clear/unclear for textarea.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase textarea'),
    defaultText = 'Share your thoughts...';
  $el.loftLabels();
  var instance = $el.data('loftLabels');

  $el.focus();
  assert.strictEqual('', instance.$el.val());

  $el.blur();
  assert.strictEqual(defaultText, instance.$el.val());

  instance.setValue('not default');

  // Does not clear if the value is not the default.
  $el.focus();
  assert.strictEqual('not default', instance.$el.val());

  $el.blur();
  assert.strictEqual('not default', instance.$el.val());

  // Goes back to default regardless of the value,.
  instance.setValue(instance.getLabel());
  assert.strictEqual(defaultText, instance.$el.val());
});
QUnit.test('Test instance.clear/unclear for textfield.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input'),
    defaultText = 'Type to search...',
    instance = $el.loftLabels({}).data('loftLabels');

  $el.focus();
  assert.strictEqual('', instance.$el.val());

  $el.blur();
  assert.strictEqual(defaultText, instance.$el.val());

  instance.setValue('not default');

  // Does not clear if the value is not the default.
  $el.focus();
  assert.strictEqual('not default', instance.$el.val());

  $el.blur();
  assert.strictEqual('not default', instance.$el.val());

  // Goes back to default regardless of the value,.
  instance.setValue(instance.getLabel());
  assert.strictEqual(defaultText, instance.$el.val());
});
QUnit.test('Check custom classes on focus, blur and hover.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');

  $el.loftLabels({
    focus: 'highlight',
    hover: 'over',
  });

  $el.focus();
  assert.strictEqual('', $el.val());
  assert.strictEqual(true, $el.hasClass('highlight'));

  $el.blur();
  assert.strictEqual(false, $el.hasClass('highlight'));

  $el.trigger('mouseenter');
  assert.strictEqual(true, $el.hasClass('over'));

  $el.trigger('mouseleave');
  assert.strictEqual(false, $el.hasClass('over'));
});

QUnit.test('Test the default value callback.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  var received = assert.async();
  var complete = assert.async();

  $el.loftLabels({
    callback: function(defaultText) {
      assert.strictEqual('Type to search...', defaultText);
      received();

      return 'Breakfast time!';
    },
  });
  setTimeout(function() {
    assert.strictEqual('Breakfast time!', $el.val());
    complete();
  }, 10);
});

QUnit.test('Test the onInit callback.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  var received = assert.async();

  $el.loftLabels({
    onInit: function(instance) {
      assert.strictEqual('Type to search...', instance.defaultText);
      assertInstance(assert, instance);
      received();
    },
  });
});

QUnit.test('Check default classes on focus, blur and hover.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');

  $el.loftLabels();

  $el.focus();
  assert.strictEqual('', $el.val());
  assert.strictEqual(true, $el.hasClass('loft-labels-is-focus'));

  $el.blur();
  assert.strictEqual(false, $el.hasClass('loft-labels-is-focus'));

  $el.trigger('mouseenter');
  assert.strictEqual(true, $el.hasClass('loft-labels-is-hover'));

  $el.trigger('mouseleave');
  assert.strictEqual(false, $el.hasClass('loft-labels-is-hover'));
});

QUnit.test('Using custom css prefix handles label correctly.', function(
  assert
) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  $el.loftLabels({ cssPrefix: 'do-re-mi-' });
  assert.ok($('#testcase label').is(':hidden'));
  assert.strictEqual('Type to search...', $el.val());
  assert.ok($el.hasClass('do-re-mi--processed'));
});

QUnit.test('Simple usage (no args) handles label correctly.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input');
  $el.loftLabels();
  assert.ok($('#testcase label').is(':hidden'));
  assert.strictEqual('Type to search...', $el.val());
  assert.ok($el.hasClass('loft-labels-processed'));
});

QUnit.test('Assert LoftLabel instance attaches to element.', function(assert) {
  $('#qunit-fixture').append(markup);
  var $el = $('#testcase input'),
    instance = $el.loftLabels().data('loftLabels');
  assert.ok(instance);
  assert.strictEqual(instance.defaultText, 'Type to search...');
});

QUnit.test('Assert LoftLabel instance attaches to multiple elements.', function(assert) {
  $('#qunit-fixture').html(markupExample2);
  var $form = $('#testcase'),
    $input = $form.find('input');
  $textarea = $form.find('textarea');
  $input.add($textarea).loftLabels();
  assert.ok($input.data('loftLabels'));
  assert.ok($textarea.data('loftLabels'));
});

QUnit.test('Able to detect version.', function(assert) {
  assert.ok($.fn.loftLabels.version, 'Version is not empty.');
});

var markup = '<form id="testcase">\n' +
  '    <div class="element">\n' +
  '      <label for="search">Type to search...</label>\n' +
  '      <input type="text" id="search" name="search" value=""/>\n' +
  '    </div>\n' +
  '    <div class="element">\n' +
  '      <textarea name="textarea_no_label">Share your thoughts...</textarea>\n' +
  '    </div>\n' +
  '  </form>\n' +
  '  <input type="text" id="tags" name="tags" value=""/>';

var markupWithoutLabel = '<span class="is-label">First name</span>\n' +
  '<input type="text" id="first_name" name="first_name" value=""/>';

var markupFormWithThreeInputs = '<form id="testcase">\n' +
  '  <div><label for="do">do</label>\n' +
  '  <label for="re">re</label>\n' +
  '  <label for="mi">mi</label></div>\n' +
  '  <input value="" name="do" id="do"  type="text"/>\n' +
  '  <input value="" name="re" id="re" type="text"/>\n' +
  '  <input value="" name="mi" id="mi" type="text"/>\n' +
  '</form>';

var markupExample2 = '<form id="testcase">\n' +
  '      <div class="form-group">\n' +
  '        <label for="search2">Your name</label>\n' +
  '        <input type="text" id="name" name="name" value="" class="form-control"/>\n' +
  '      </div>\n' +
  '      <div class="form-group">\n' +
  '        <label for="comment">Share your thoughts...</label>\n' +
  '        <textarea name="comment" id="comment" cols="30" rows="10" class="form-control"></textarea>\n' +
  '      </div>\n' +
  '      <p>Notice when all required are filled out the form submit button becomes available with proper\n' +
  '        text.</p>\n' +
  '      <button>Submit</button>\n' +
  '    </form>';

var markupScopeForm = '<form id="testcase">\n' +
  '    <div class="form-group">\n' +
  '      <label for="name">Full name</label>\n' +
  '      <input type="text" id="name" name="name" value="" class="form-control"/>\n' +
  '    </div>\n' +
  '    <div class="form-group">\n' +
  '      <label for="email">Email</label>\n' +
  '      <input type="text" id="email" name="email" value="" class="form-control"/>\n' +
  '    </div>\n' +
  '    <div class="form-group">\n' +
  '      <label for="phone">Phone number</label>\n' +
  '      <input type="text" id="phone" name="phone" value="" class="form-control"/>\n' +
  '    </div>\n' +
  '    <button>Register</button>\n' +
  '  </form>';

var markupResponsive = '<label for="responsive-demo" data-label-medium="Medium label" data-label-large="Large label">Small label</label>\n' +
  '    <input type="text" name="responsive_demo" id="responsive-demo"/>';

function assertInstance(assert, instance) {
  assert.ok(instance.defaultText);
  assert.strictEqual('object', typeof instance.$el);
  assert.strictEqual('object', typeof instance.$label);
  assert.strictEqual('object', typeof instance.settings);
  assert.strictEqual('object', typeof instance.states);
  assert.strictEqual('function', typeof instance.getValue);
  assert.strictEqual('function', typeof instance.setValue);
  assert.strictEqual('function', typeof instance.getLabel);
}
