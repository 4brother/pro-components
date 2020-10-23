import './index.less';
import { computed, ref, VNodeChild, inject } from 'vue';

// import 'ant-design-vue/es/layout/style';
// import Layout from 'ant-design-vue/es/layout';
import { Layout } from 'ant-design-vue';
import BaseMenu, { BaseMenuProps } from './BaseMenu';
import { WithFalse } from '../typings';
import { SiderProps } from './typings';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { defaultProProviderProps, injectProConfigKey } from '../ProProvider';

const { Sider } = Layout;

export type PrivateSiderMenuProps = {
  matchMenuKeys: string[];
};

export interface SiderMenuProps
  extends Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>> {
  logo?: VNodeChild | JSX.Element;
  siderWidth?: number;
  collapsedWidth?: number;
  menuHeaderRender?: WithFalse<
    (
      logo: VNodeChild | JSX.Element,
      title: VNodeChild | JSX.Element,
      props?: SiderMenuProps,
    ) => VNodeChild
  >;
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => VNodeChild>;
  menuContentRender?: WithFalse<
    (props: SiderMenuProps, defaultDom: VNodeChild | JSX.Element) => VNodeChild
  >;
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => VNodeChild>;
  collapsedButtonRender?: WithFalse<(collapsed?: boolean) => VNodeChild>;
  breakpoint?: SiderProps['breakpoint'] | false;
  onMenuHeaderClick?: (e: MouseEvent) => void;
  fixed?: boolean;
  hide?: boolean;
  onOpenChange?: (openKeys: WithFalse<string[]>) => void;
  onSelect?: (selectedKeys: WithFalse<string[]>) => void;
}

export const defaultRenderLogo = (logo: VNodeChild | JSX.Element): VNodeChild | JSX.Element => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

export const defaultRenderLogoAndTitle = (
  props: SiderMenuProps,
  renderKey: string = 'menuHeaderRender',
): VNodeChild | JSX.Element => {
  const {
    logo = 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
    title,
    layout,
  } = props;
  const renderFunction = props[renderKey || ''];
  if (renderFunction === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1>{title}</h1>;
  if (renderFunction) {
    // when collapsed, no render title
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props);
  }
  if (layout === 'mix' && renderKey === 'menuHeaderRender') {
    return null;
  }
  return (
    <a>
      {logoDom}
      {props.collapsed ? null : titleDom}
    </a>
  );
};

export const defaultRenderCollapsedButton = (collapsed?: boolean) =>
  collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;

const SiderMenu = (props: SiderMenuProps) => {
  const {
    menuData,
    collapsed,
    siderWidth,
    menuExtraRender = false,
    onOpenChange,
    onSelect,
    collapsedWidth = 48,
  } = props;
  const { getPrefixCls } = inject(injectProConfigKey, defaultProProviderProps);
  const baseClassName = getPrefixCls('sider');

  const isMix = computed(() => props.layout === 'mix');
  const fixed = computed(() => props.fixed);
  const runtimeTheme = computed(() => (props.layout === 'mix' && 'light') || 'dark');
  const runtimeSideWidth = computed(() =>
    props.collapsed ? props.collapsedWidth : props.siderWidth,
  );

  const classNames = ref({
    [baseClassName]: true,
    [`${baseClassName}-${runtimeTheme.value}`]: true,
    [`${baseClassName}-${props.layout}`]: true,
    [`${baseClassName}-fixed`]: fixed,
  });

  const headerDom = defaultRenderLogoAndTitle(props);

  const extraDom = menuExtraRender && menuExtraRender(props);

  return (
    <>
      {fixed.value && (
        <div
          style={{
            width: `${runtimeSideWidth.value}px`,
            overflow: 'hidden',
            flex: `0 0 ${runtimeSideWidth.value}px`,
            maxWidth: `${runtimeSideWidth.value}px`,
            minWidth: `${runtimeSideWidth.value}px`,
          }}
        />
      )}
      <Sider
        class={classNames.value}
        width={siderWidth}
        collapsed={collapsed}
        collapsible={false}
        collapsedWidth={collapsedWidth}
      >
        <div class="ant-pro-sider-logo">{headerDom}</div>
        <div style="flex: 1 1 0%; overflow: hidden auto;">
          <BaseMenu
            menus={menuData}
            theme={props.theme}
            mode="inline"
            collapsed={props.collapsed}
            openKeys={props.openKeys}
            selectedKeys={props.selectedKeys}
            style={{
              width: '100%',
            }}
            class={`${baseClassName}-menu`}
            {...{
              'onUpdate:openKeys': $event => {
                onOpenChange($event);
              },
              'onUpdate:selectedKeys': $event => {
                onSelect($event);
              },
            }}
          />
        </div>
      </Sider>
    </>
  );
};

export default SiderMenu;
