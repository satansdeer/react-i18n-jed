// @flow strict
import React from 'react';
import { mount } from 'enzyme';
import { Jed, translate, useI18n, I18nProvider, type I18nType } from '../src';
import I18nContext from '../src/I18nContext';
import mockI18n from '../src/mockI18n';

const localeJSON = {
    domain: 'messages',
    language: 'en-US',
    locale_data: {
        messages: {
            '': {
                domain: 'messages',
            },
            'Ad Expense': ['Test Ad Expense'],
            'App or Publisher': ['App or Publisher'],
            Cat: ['Cat', 'Cats'],
        },
    },
};

class TestElement extends React.PureComponent<{
    testProp: string,
    i18n: I18nType,
}> {
    render() {
        const { i18n } = this.props;
        return <div>{i18n.gettext('Test')}</div>;
    }
}

describe('get i18n by Jed', () => {
    it('gettext by Jed', () => {
        const i18n = new Jed(localeJSON);
        expect(i18n.gettext('Ad Expense')).toBe('Test Ad Expense');
    });
});

describe('i18n hook', () => {
    it('get i18n by useI18n', () => {
        const Fake = () => {
            const i18n = useI18n();

            return <span>{i18n.gettext('Fake')}</span>;
        };

        const fakeI18n = {
            ...mockI18n,
            gettext: key => {
                const translation = {
                    Fake: 'Translated Fake',
                };

                return translation[key];
            },
        };
        const t = mount(
            <I18nContext.Provider value={fakeI18n}>
                <Fake />
            </I18nContext.Provider>
        );

        expect(t.find('span').text()).toEqual('Translated Fake');
    });
});

describe('<I18nProvider>', () => {
    it('children get i18n from I18nProvider', () => {
        const LocalizedTest = translate(TestElement);
        const WrappedTest = LocalizedTest.WrappedComponent;
        expect(<WrappedTest testProp="required" i18n={mockI18n} />).toMatchSnapshot();

        const eleWithProvider = mount(
            <I18nProvider i18n={mockI18n}>
                <LocalizedTest testProp="required" />
            </I18nProvider>
        );

        expect(eleWithProvider).toMatchSnapshot();

        const i18nFromProvider = eleWithProvider.find('TestElement').prop('i18n');
        expect(i18nFromProvider).toEqual(mockI18n);
    });
});

describe('translate Component', () => {
    it('render translated component', () => {
        const LocalizedEle = translate(TestElement);
        const localizedEle = mount(<LocalizedEle i18n={mockI18n} testProp="required" />);
        const instEle = localizedEle.instance();
        // $FlowFixMe
        expect(instEle.props.i18n).toEqual(mockI18n);
        expect(localizedEle).toMatchSnapshot();
    });

    it('render translated stateless component', () => {
        const StatelessTest = ({
            i18n,
            testProp,
        }: {
            i18n: I18nType,
            testProp: string,
        }) => (
            <div>
                {i18n.gettext('My')}
                {testProp}
            </div>
        );

        const LocalizedEle = translate(StatelessTest);
        const localizedEle = mount(<LocalizedEle i18n={mockI18n} testProp="required" />);
        expect(localizedEle).toMatchSnapshot();
    });

    it('render anonymous component', () => {
        const LocalizedEle = translate(
            ({ i18n, testProp }: { i18n: I18nType, testProp: string }) => (
                <div>
                    {i18n.gettext('My')}
                    {testProp}
                </div>
            )
        );
        const localizedEle = mount(<LocalizedEle i18n={mockI18n} testProp="required" />);
        expect(localizedEle).toMatchSnapshot();
    });

    it('should inherit ref properly', () => {
        class A extends React.Component<{ i18n: I18nType }, {}> {
            getName = () => 'NameA';

            render() {
                return <div />;
            }
        }

        const B = translate(A);

        class C extends React.Component<{}, {}> {
            ref = React.createRef();

            test = () => {
                const { current } = this.ref;
                if (current && typeof current.getName === 'function') {
                    return current.getName();
                }
                return '';
            };

            render() {
                return <B innerRef={this.ref} />;
            }
        }
        const Test = mount(<C />);
        const instance = Test.instance();
        expect(instance.test()).toEqual('NameA');
    });
});

describe('mock i18n', () => {
    it('gettext get translated message', () => {
        expect(mockI18n.gettext('txt')).toEqual('txt');
    });

    it('ngettext get translated message', () => {
        expect(mockI18n.ngettext('a', 'b', 1)).toEqual('a');
        expect(mockI18n.ngettext('a', 'b', 2)).toEqual('b');
    });

    it('pgettext get translated message', () => {
        expect(mockI18n.pgettext('ctx', 'a')).toEqual('a');
    });

    it('pgettext get translated message', () => {
        expect(mockI18n.npgettext('a', 'b', 'c', 1)).toEqual('b');
        expect(mockI18n.npgettext('a', 'b', 'c', 2)).toEqual('c');
    });
});
