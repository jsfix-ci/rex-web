import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import AllOrNone from '../../../components/AllOrNone';
import Checkbox from '../../../components/Checkbox';
import { match, not } from '../../../fpUtils';
import MessageProvider from '../../../MessageProvider';
import { highlightStyles } from '../../constants';
import ColorFilter, { ColorFilterProps } from './ColorFilter';

describe('ColorFilter', () => {
  let props: ColorFilterProps;

  beforeEach(() => {
    props = {
      colorFiltersWithContent: new Set([
        HighlightColorEnum.Blue,
        HighlightColorEnum.Green,
        HighlightColorEnum.Pink,
        HighlightColorEnum.Purple,
        HighlightColorEnum.Yellow,
      ]),
      labelKey: (label: HighlightColorEnum) => `i18n:highlighting:colors:${label}`,
      selectedColorFilters: new Set([
        HighlightColorEnum.Blue,
        HighlightColorEnum.Green,
        HighlightColorEnum.Pink,
        HighlightColorEnum.Purple,
        HighlightColorEnum.Yellow,
      ]),
      setSummaryFilters: jest.fn(),
      styles: highlightStyles,
    };
  });

  it('matches snapshot', () => {
    const colorFiltersWithContent = new Set([
      HighlightColorEnum.Pink,
      HighlightColorEnum.Green,
      HighlightColorEnum.Yellow,
    ]);

    const component = renderer.create(<MessageProvider>
      <ColorFilter
        {...props}
        selectedColorFilters={new Set([
          HighlightColorEnum.Green,
          HighlightColorEnum.Pink,
          HighlightColorEnum.Yellow,
        ])}
        colorFiltersWithContent={colorFiltersWithContent}
      />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unchecks colors', () => {
    const colorFiltersWithContent = new Set([
      HighlightColorEnum.Green,
      HighlightColorEnum.Yellow,
    ]);

    const component = renderer.create(<MessageProvider>
      <ColorFilter {...props} colorFiltersWithContent={colorFiltersWithContent} />
    </MessageProvider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(props.setSummaryFilters).toHaveBeenCalledWith({
      colors: Array.from(props.selectedColorFilters).filter(not(match(highlightStyles[0].label))),
    });
  });

  it('checks colors', () => {
    const colorFiltersWithContent = new Set([
      HighlightColorEnum.Green,
      HighlightColorEnum.Yellow,
    ]);
    const selectedColorFilters = new Set(highlightStyles.slice(2, 5).map((style) => style.label));

    const component = renderer.create(<MessageProvider>
      <ColorFilter
        {...props}
        colorFiltersWithContent={colorFiltersWithContent}
        selectedColorFilters={selectedColorFilters}
      />
    </MessageProvider>);

    const [box1, box2, box3] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
    expect(box3.props.checked).toBe(true);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(props.setSummaryFilters).toHaveBeenCalledWith({
      colors: [...Array.from(selectedColorFilters), highlightStyles[0].label],
    });
  });

  it('selects none', () => {
    const colorFiltersWithContent = new Set([
      HighlightColorEnum.Green,
      HighlightColorEnum.Yellow,
    ]);

    const component = renderer.create(<MessageProvider>
      <ColorFilter {...props} colorFiltersWithContent={colorFiltersWithContent} />
    </MessageProvider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(props.setSummaryFilters).toHaveBeenCalledWith({ colors: []});
  });

  it('selects all selects only colors witch have highlights', () => {
    const colorFiltersWithContent = new Set([
      HighlightColorEnum.Green,
      HighlightColorEnum.Yellow,
    ]);

    const component = renderer.create(<MessageProvider>
      <ColorFilter
        {...props}
        colorFiltersWithContent={colorFiltersWithContent}
        selectedColorFilters={new Set()}
      />
    </MessageProvider>);

    const [yellow, green, blue, purple, pink] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    expect(blue.props.checked).toBe(false);
    expect(green.props.checked).toBe(false);
    expect(pink.props.checked).toBe(false);
    expect(purple.props.checked).toBe(false);
    expect(yellow.props.checked).toBe(false);

    renderer.act(() => {
      allOrNone.props.onAll();
    });

    expect(props.setSummaryFilters).toHaveBeenCalledWith({ colors: Array.from(colorFiltersWithContent) });
  });
});