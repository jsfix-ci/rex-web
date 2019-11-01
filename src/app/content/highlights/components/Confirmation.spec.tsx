import React from 'react';
import renderer from 'react-test-renderer';
import { makeFindByTestId, renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import { assertDocument } from '../../../utils';
import Confirmation from './Confirmation';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('Confirmation', () => {
  it('matches snapshot no selection', () => {
    const component = renderer.create(<MessageProvider onError={() => null}>
      <Confirmation
        message='message'
        confirmMessage='confirm'
        onConfirm={() => null}
        onCancel={() => null}
      />
    </MessageProvider>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onConfirm', () => {
    const onConfirm = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <Confirmation
        message='message'
        confirmMessage='confirm'
        onConfirm={onConfirm}
        onCancel={() => null}
      />
    </MessageProvider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');
    button.props.onClick({preventDefault: jest.fn()});

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel', () => {
    const onCancel = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <Confirmation
        message='message'
        confirmMessage='confirm'
        onConfirm={() => null}
        onCancel={onCancel}
      />
    </MessageProvider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('cancel');
    button.props.onClick({preventDefault: jest.fn()});

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls always', () => {
    const always = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <Confirmation
        message='message'
        confirmMessage='confirm'
        onConfirm={() => null}
        onCancel={() => null}
        always={always}
      />
    </MessageProvider>);

    const findByTestId = makeFindByTestId(component.root);
    findByTestId('confirm').props.onClick({preventDefault: jest.fn()});
    findByTestId('cancel').props.onClick({preventDefault: jest.fn()});

    expect(always).toHaveBeenCalledTimes(2);
  });

  it('focuses on mount', () => {
    const {node} = renderToDom(<MessageProvider onError={() => null}>
      <Confirmation
        message='message'
        confirmMessage='confirm'
        onConfirm={() => null}
        onCancel={() => null}
      />
    </MessageProvider>);

    expect(assertDocument().activeElement).toBe(node);
  });
});
