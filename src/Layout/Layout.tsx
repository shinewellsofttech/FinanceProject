import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../ReduxToolkit/Hooks"
import { setToggleSidebar } from "../ReduxToolkit/Reducers/LayoutSlice"
import { setLayout } from "../ReduxToolkit/Reducers/ThemeCustomizerSlice"
import Footer from "./Footer/Footer"
import Header from "./Header/Header"
import Loader from "./Loader/Loader"
import Sidebar from "./Sidebar/Sidebar"
import TapTop from "./TapTop/TapTop"
import ThemeCustomizer from "./ThemeCustomizer/ThemeCustomizer"
import { Outlet } from "react-router-dom"

const Layout = () => {
  const { layout } = useAppSelector((state) => state.themeCustomizer)
  const { toggleSidebar, scroll } = useAppSelector((state) => state.layout)
  const dispatch = useAppDispatch()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const compactSidebar = () => {
    let windowWidth = window.innerWidth;
    if (layout === "compact-wrapper") {
      if (windowWidth < 1200) {
        dispatch(setToggleSidebar(true))
      }
      else {
        dispatch(setToggleSidebar(false))
      }
    } else if (layout === "horizontal-wrapper") {
      if (windowWidth < 992) {
        dispatch(setToggleSidebar(true))
        dispatch(setLayout("compact-wrapper"))
      }
      else {
        dispatch(setToggleSidebar(false))
        dispatch(setLayout(localStorage.getItem("layout")))
      }
    }
  };
  useEffect(() => {
    compactSidebar();
    window.addEventListener("resize", () => {
      compactSidebar();
    });
  }, [layout]);
  return (
    <>
      <style>{`
        .page-body-wrapper div.sidebar-wrapper {
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          height: 100vh !important;
          max-height: 100vh !important;
          overflow: hidden !important;
        }
        .page-body-wrapper div.sidebar-wrapper > div {
          height: 100% !important;
          max-height: 100vh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .page-body-wrapper div.sidebar-wrapper .sidebar-main {
          flex: 1 !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
        }
        .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links {
          height: 100% !important;
          max-height: calc(100vh - 80px) !important;
          overflow: auto !important;
          flex: 1 !important;
          min-height: 0 !important;
        }
        .page-body-wrapper div.sidebar-wrapper .logo-wrapper,
        .page-body-wrapper div.sidebar-wrapper .logo-icon-wrapper {
          flex-shrink: 0 !important;
        }
        .sidebar-submenu-collapse {
          list-style: none !important;
        }
        .sidebar-submenu-collapse > li.sidebar-list {
          position: relative;
          padding: 2px 0 !important;
          background-color: transparent;
        }
        .sidebar-submenu-collapse > li.sidebar-list > a.sidebar-link {
          display: flex !important;
          align-items: center;
          padding: 4px 15px 4px 18px !important;
          margin: 0 3px;
          line-height: 1.4;
          border-radius: 5px;
        }
        .sidebar-submenu-collapse > li.sidebar-list > a.sidebar-link svg,
        .sidebar-submenu-collapse > li.sidebar-list > a.sidebar-link .stroke-icon,
        .sidebar-submenu-collapse > li.sidebar-list > a.sidebar-link .fill-icon {
          min-width: 22px !important;
          width: 22px !important;
          flex-shrink: 0 !important;
          margin-right: 12px !important;
        }
        .sidebar-wrapper.close_icon .sidebar-submenu-collapse .sidebar-link span {
          display: none !important;
        }
        .sidebar-wrapper.close_icon .sidebar-main-title,
        .sidebar-wrapper.close_icon .sidebar-submenu-collapse {
          display: none !important;
        }
      `}</style>
      <Loader />
      <TapTop />
      <div className={`page-wrapper ${layout}`}>
        <div className={`page-header ${toggleSidebar ? "close_icon" : ""}`} style={{ display: scroll ? "none" : "" }}>
          <Header />
        </div>
        <div className={`page-body-wrapper ${scroll ? "scorlled" : ""}`}>
          {isMobile && !toggleSidebar && (
            <div 
              className="sidebar-mobile-backdrop active" 
              onClick={() => dispatch(setToggleSidebar(true))} 
            />
          )}
          <Sidebar />
          <Outlet />
          <Footer />
        </div>
      </div>
      <ThemeCustomizer />
    </>
  )
}

export default Layout