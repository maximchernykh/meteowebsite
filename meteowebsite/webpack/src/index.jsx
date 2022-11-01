import "antd/dist/antd.min.css";
import "./index.css";

import React, { useState, useRef, Suspense, lazy } from "react";
import { render } from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ConfigProvider, Menu, Empty } from "antd";
const { SubMenu } = Menu;
import { Layout, Button } from "antd";
const { Header, Sider } = Layout;
import { Spin } from "antd";
import { MenuOutlined, LoadingOutlined } from "@ant-design/icons";

import messages from "./messages";
const antdLocaleList = {
  "en-US": require("antd/lib/locale/en_US").default,
  "ru-RU": require("antd/lib/locale/ru_RU").default,
};
if (!Object.keys(messages).includes(localStorage.getItem("locale"))) {
  localStorage.removeItem("locale");
}
const defaultLocale =
  localStorage.getItem("locale") ||
  (Object.keys(messages).includes(navigator.language)
    ? navigator.language
    : "en-US");
import Flags from "country-flag-icons/react/3x2";
import { IntlProvider } from "react-intl";
import { FormattedMessage } from "react-intl";

import {
  DatabaseOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import useIsMobile from "./components/IsMobileHook";
const DataTable = lazy(() => import("./components/DataTable"));
const Map = lazy(() => import("./components/Map"));

function App() {
  const [locale, setLocale] = useState(defaultLocale);
  const [antLocale, setAntLocale] = useState(antdLocaleList[defaultLocale]);
  const handleLocaleChange = (selected) => {
    const lang = selected.key;
    localStorage.setItem("locale", lang);
    setLocale(lang);
    setAntLocale(antdLocaleList[lang]);
  };

  const isMobile = useIsMobile();
  const [mobileSiderVisible, setMobileSiderVisible] = useState(true);
  const showMobileSider = () => {
    setMobileSiderVisible(!mobileSiderVisible);
  };

  const location = useLocation();

  const menuContent = (
    <div>
      <Menu
        theme="dark"
        mode="vertical"
        defaultSelectedKeys={
          location.pathname.split("/")[1] == ""
            ? ["datatable"]
            : location.pathname.split("/")
        }
      >
        <Menu.Item key="datatable" icon={<DatabaseOutlined />}>
          <NavLink to="datatable">
            <FormattedMessage id="nav.datatable" />
          </NavLink>
        </Menu.Item>
        <Menu.Item key="map" icon={<EnvironmentOutlined />}>
          <NavLink to="map">
            <FormattedMessage id="nav.map" />
          </NavLink>
        </Menu.Item>
      </Menu>
      <Menu
        theme="dark"
        mode="vertical"
        defaultSelectedKeys={[locale]}
        onSelect={handleLocaleChange}
        subMenuCloseDelay={0.2}
      >
        <SubMenu
          key="settings"
          icon={<GlobalOutlined />}
          title={<FormattedMessage id="nav.language" />}
          style={{ color: "hsla(0,0%,100%,.65)" }}
        >
          <Menu.Item
            key="en-US"
            icon={<Flags.US className="anticon" style={{ height: "14px" }} />}
          >
            English
          </Menu.Item>
          <Menu.Item
            key="ru-RU"
            icon={<Flags.RU className="anticon" style={{ height: "14px" }} />}
          >
            Русский
          </Menu.Item>
        </SubMenu>
      </Menu>
    </div>
  );

  const content = (
    <Suspense
      fallback={
        <Spin
          size="large"
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          style={{ margin: "auto" }}
        />
      }
    >
      <Routes>
        <Route path="" element={<Navigate to="datatable" />} />
        <Route path="datatable" element={<DataTable />} />
        <Route path="map" element={<Map />} />
        <Route
          path="*"
          element={
            <Empty
              style={{ margin: "auto" }}
              description={<FormattedMessage id="nav.pageNotFound" />}
            />
          }
        />
      </Routes>
    </Suspense>
  );

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <ConfigProvider locale={antLocale}>
        {isMobile ? (
          <Layout style={{ height: "100vh" }}>
            <Header
              style={{
                height: "50px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button icon={<MenuOutlined />} onClick={showMobileSider} />
            </Header>
            <Layout>
              <Sider
                collapsed={mobileSiderVisible}
                collapsible
                collapsedWidth={0}
                style={{ position: "fixed", zIndex: 100, height: "100%" }}
                zeroWidthTriggerStyle={{ display: "none" }}
              >
                {menuContent}
              </Sider>
              {content}
            </Layout>
          </Layout>
        ) : (
          <Layout style={{ height: "100vh" }}>
            <Sider collapsible collapsedWidth={40}>
              {menuContent}
            </Sider>
            {content}
          </Layout>
        )}
      </ConfigProvider>
    </IntlProvider>
  );
}

const rootElement = document.getElementById("app");
render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootElement
);
