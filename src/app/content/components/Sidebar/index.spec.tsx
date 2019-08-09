import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import ConnectedSidebar, { TableOfContents } from '.';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import { AppState, Store } from '../../../types';
import * as actions from '../../actions';
import { initialState } from '../../reducer';
import { formatBookData } from '../../utils';
import { expandCurrentChapter, scrollSidebarSectionIntoView } from '../../utils/domUtils';

const book = formatBookData(archiveBook, mockCmsBook);

jest.mock('../../utils/domUtils');

describe('Sidebar', () => {
  let store: Store;

  beforeEach(() => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    store = createTestStore(state);
  });

  it('expands and scrolls to current chapter', () => {
    renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(expandCurrentChapter).not.toHaveBeenCalled();
    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(1);

    renderer.act(() => {
      store.dispatch(actions.receivePage({...shortPage, references: []}));
    });

    expect(expandCurrentChapter).toHaveBeenCalled();
    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(2);
  });

  it('opens and closes', () => {
    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(null);
    renderer.act(() => {
      store.dispatch(actions.closeToc());
    });
    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(false);
    renderer.act(() => {
      store.dispatch(actions.openToc());
    });
    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(true);
  });

  it('resets toc on navigate', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    component.root.findAllByType('a')[0].props.onClick({preventDefault: () => null});
    expect(dispatchSpy).toHaveBeenCalledWith(actions.resetToc());
  });

  it('resizes on scroll', () => {
    if (!document || !window) {
      expect(window).toBeTruthy();
      return expect(document).toBeTruthy();
    }

    const render = () => <MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>;

    const {node} = renderToDom(render());
    const spy = jest.spyOn(node.style, 'setProperty');

    const event = document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });
});
