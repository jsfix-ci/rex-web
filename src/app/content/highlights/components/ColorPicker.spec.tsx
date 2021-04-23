import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { highlightStyles } from '../../constants';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
      services = createTestServices();
    });

  it('matches snapshot no selection', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
      <ColorPicker onChange={jest.fn()} onRemove={jest.fn()} />
      </MessageProvider>
    </Services.Provider>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('checks selection', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker color={highlightStyles[0].label} onChange={jest.fn()} onRemove={jest.fn()} />
      </MessageProvider>
    </Services.Provider>);

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('checks selection (multiple)', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={jest.fn()} onRemove={jest.fn()} />
      </MessageProvider>
    </Services.Provider>);

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('calls update when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
      </MessageProvider>
    </Services.Provider>);

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(highlightStyles[1].label);
  });

  it('calls update when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
      </MessageProvider>
    </Services.Provider>);

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([highlightStyles[0].label, highlightStyles[1].label]);
  });

  it('calls remove when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
      </MessageProvider>
    </Services.Provider>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls remove when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
      </MessageProvider>
    </Services.Provider>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('do not call remove if it was not passed', () => {
    const onChange = jest.fn();

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <ColorPicker color={highlightStyles[0].label} onChange={onChange} />
      </MessageProvider>
    </Services.Provider>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onChange).not.toHaveBeenCalled();
  });
});
