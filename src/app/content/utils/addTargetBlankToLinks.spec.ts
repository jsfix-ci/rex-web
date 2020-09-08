import addTargetBlankToLinks from './addTargetBlankToLinks';

describe('addTargetBlankToLinks', () => {
  it('adds target _blank to all <a> tags' , () => {
    const input = '<div class="test">'
    + '<a href="some/link">First link</a>'
    + '<a href="some/link">Second link</a>'
    + '</div>';

    const output = '<div class="test">'
    + '<a href="some/link" target="_blank">First link</a>'
    + '<a href="some/link" target="_blank">Second link</a>'
    + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(output);
  });

  it('overrides target attribute - set it to _blank on all <a> tags' , () => {
    const input = '<div class="test">'
    + '<a href="some/link" target="_parent">First link</a>'
    + '<a href="some/link" target="_self">Second link</a>'
    + '<a href="some/link" target="_top">Third link</a>'
    + '<a href="some/link" target="_blank">Forth link</a>'
    + '</div>';

    const output = '<div class="test">'
    + '<a href="some/link" target="_blank">First link</a>'
    + '<a href="some/link" target="_blank">Second link</a>'
    + '<a href="some/link" target="_blank">Third link</a>'
    + '<a href="some/link" target="_blank">Forth link</a>'
    + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(output);
  });

  it('noop if there are no <a> tags in the document', () => {
    const input = '<div class="test">'
      + '<span>123</span>'
      + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(input);
  });

  it('do not throw if passed string does not contian html elements', () => {
    const input = '123 asdas d';

    expect(addTargetBlankToLinks(input)).toEqual(input);
  });
});