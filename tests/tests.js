/**
 * @file
 * Tests provided against the LoftLabels class.
 *
 * @ingroup loft_labels
 * @{
 */
var QUnit = QUnit || {};
QUnit.storage = {};

//
//
// Build your tests below here...
//
// QUnit.test("Test textarea with no label", function (assert) {
//   var $el = $('#textarea_no_label');
//   $el.loftLabels();
// });

QUnit.test("Test instance.default for textarea.", function (assert) {
  var $el = $('#loft-labels-a textarea');
  assert.strictEqual('Share your thoughts...', $el.loftLabels().data('loftLabels').defaultText);
});


QUnit.test("Test instance.default for textfield.", function (assert) {
  var $el = $('#loft-labels-a input');
  assert.strictEqual('Type to search...', $el.loftLabels().data('loftLabels').defaultText);
});


QUnit.test("Test the instance is available at the $el.data('loftLabels')", function (assert) {
  var $el = $('#loft-labels-a input');
  $el.loftLabels();
  assert.ok($el.data('loftLabels'));
});


QUnit.test("Test when input has no id.", function (assert) {
  var control = $('#loft-labels-a label').text();
  var done = assert.async();
  var $el = $('#loft-labels-a input');
  $el.removeAttr('id');
  assert.ok(!$el.attr('id'));

  $el.loftLabels({
    onInit: function () {
      assert.strictEqual($el.val(), control);
      done();
    }
  });
});

QUnit.test("Test the is-default class is applied/removed.", function (assert) {
  var $el = $('#loft-labels-a input');
  $el.loftLabels();

  assert.ok($el.hasClass('loft-labels-is-default'));

  $el.focus().val('not the default');
  assert.ok(!$el.hasClass('loft-labels-is-default'));

  $el.val('').blur();
  assert.ok($el.hasClass('loft-labels-is-default'));
});

QUnit.test("Test instance.clear/unclear for textarea.", function (assert) {
  var $el = $('#loft-labels-a textarea'),
      defaultText = 'Share your thoughts...';
  $el.loftLabels();
  var instance = $el.data('loftLabels');

  instance.clear();
  assert.strictEqual('', instance.$el.val());

  instance.unclear();
  assert.strictEqual(defaultText, instance.$el.val());

  instance.$el.val('not default');

  // Does not clear if the value is not the default.
  instance.clear();
  assert.strictEqual('not default', instance.$el.val());

  instance.unclear();
  assert.strictEqual('not default', instance.$el.val());

  // Goes back to default regardless of the value,.
  instance.default();
  assert.strictEqual(defaultText, instance.$el.val());
});

QUnit.test("Test instance.clear/unclear for textfield.", function (assert) {
  var $el = $('#loft-labels-a input');
  var instances = [];
  var defaultText = 'Type to search...';
  $el.loftLabels({}, instances);
  var instance = instances[0];

  instance.clear();
  assert.strictEqual('', instance.$el.val());

  instance.unclear();
  assert.strictEqual(defaultText, instance.$el.val());

  instance.$el.val('not default');

  // Does not clear if the value is not the default.
  instance.clear();
  assert.strictEqual('not default', instance.$el.val());

  instance.unclear();
  assert.strictEqual('not default', instance.$el.val());

  // Goes back to default regardless of the value,.
  instance.default();
  assert.strictEqual(defaultText, instance.$el.val());
});

QUnit.test("Test using the instance returned.", function (assert) {
  var $el = $('#loft-labels-a input');
  var instances = [];
  var defaultText = 'Type to search...';
  $el.loftLabels({}, instances);
  assert.strictEqual(1, instances.length);
  var instance = instances[0];
  assertInstance(assert, instance);
  assert.strictEqual(defaultText, instance.$el.val());
  assert.strictEqual(defaultText, $(instance.el).val());
  assert.strictEqual(defaultText, instance.defaultText);
});

QUnit.test("Test the onInit callback.", function (assert) {
  var $el = $('#loft-labels-a input');
  var received = assert.async();

  $el.loftLabels({
    onInit: function (instance) {
      assert.strictEqual('Type to search...', instance.defaultText);
      assertInstance(assert, instance);
      received();
    }
  });
});

QUnit.test("Test the default value callback.", function (assert) {
  var $el = $('#loft-labels-a input');
  var received = assert.async();
  var complete = assert.async();

  $el.loftLabels({
    callback: function (defaultText) {
      assert.strictEqual('Type to search...', defaultText);
      received();

      return "Breakfast time!";
    }
  });
  setTimeout(function () {
    assert.strictEqual('Breakfast time!', $el.val());
    complete();
  }, 10);
});

QUnit.test("Check custom classes on focus, blur and hover.", function (assert) {
  var $el = $('#loft-labels-a input');

  $el.loftLabels({
    focus: "highlight",
    hover: "over"
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

QUnit.test("Check default classes on focus, blur and hover.", function (assert) {
  var $el = $('#loft-labels-a input');

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

QUnit.test("Using custom css prefix handles label correctly.", function (assert) {
  var $el = $('#loft-labels-a input');

  $el.loftLabels({cssPrefix: 'do-re-mi-'});

  assert.ok($('#loft-labels-a label').is(':hidden'));
  assert.strictEqual('Type to search...', $el.val());
  assert.ok($el.hasClass('do-re-mi--processed'));
});

QUnit.test("Simple usage (no args) handles label correctly.", function (assert) {
  var $el = $('#loft-labels-a input');

  $el.loftLabels();

  assert.ok($('#loft-labels-a label').is(':hidden'));
  assert.strictEqual('Type to search...', $el.val());
  assert.ok($el.hasClass('loft-labels-processed'));
});

function assertInstance(assert, instance) {
  assert.ok(instance.defaultText);
  assert.strictEqual('object', typeof instance.el);
  assert.strictEqual('object', typeof instance.$el);
  assert.strictEqual('object', typeof instance.settings);
  assert.strictEqual('function', typeof instance.init);
  assert.strictEqual('function', typeof instance.value);
  assert.strictEqual('function', typeof instance.clear);
  assert.strictEqual('function', typeof instance.unclear);
  assert.strictEqual('function', typeof instance.default);
}


//
//
// Per test setup
//
QUnit.testStart(function (details) {
  // Create a new DOM element #test, cloned from #template.
  $('#test').replaceWith(QUnit.storage.$template.clone().attr('id', 'test'));
});

QUnit.testDone(function () {

  // Reset the html classes per the default.
  $('html').attr('class', QUnit.storage.htmlClass);
});

// Callback fires before all tests.
QUnit.begin(function () {
  QUnit.storage.htmlClass = $('html').attr('class') || '';
  QUnit.storage.$template = $('#template').clone();
  $('#template').replaceWith(QUnit.storage.$template.clone().attr('id', 'test'));
});

// Callback fires after all tests.
QUnit.done(function () {
  $('#test').replaceWith(QUnit.storage.$template);
});
