import React from 'react';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import TestContainer from '../../../test/TestContainer';
import { assertWindow } from '../../utils/browser-assertions';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

// tslint:disable-next-line:variable-name
const Buggy = () => {
  throw new Error('this is a bug');
};

const rejectionEvent = new CustomEvent('unhandledrejection', { cancelable: true });
Object.defineProperty(rejectionEvent, 'reason', { value: 'a bug' });

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation((msg) => msg);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('matches snapshot', () => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2021);
    const tree = renderer
      .create(<TestContainer>
          <ErrorBoundary><Buggy /></ErrorBoundary>
        </TestContainer>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('captures unhandled rejected promises', () => {
    const tree = renderer.create(<TestContainer>
      <ErrorBoundary>test</ErrorBoundary>
    </TestContainer>);

    assertWindow().dispatchEvent(rejectionEvent);
    expect(tree).toMatchSnapshot();
    expect(rejectionEvent.defaultPrevented).toBe(true);
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
