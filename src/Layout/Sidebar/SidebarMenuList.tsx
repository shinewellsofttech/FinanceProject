import { Fragment, useState, useMemo, useEffect } from 'react'
import { useAppSelector } from '../../ReduxToolkit/Hooks';
import { MenuList } from '../../Data/LayoutData/SidebarData';
import Menulist from './Menulist';
import { MenuItem } from '../../Types/Layout/SidebarType';
import { H6, LI, UL } from '../../AbstractElements';
import { useTranslation } from 'react-i18next';
import { usePermissions, loadPermissionsFromStorage } from '../../helpers/permissionsHelper';

const SidebarMenuList = () => {
  const [activeMenu, setActiveMenu] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { pinedMenu } = useAppSelector((state) => state.layout);
  const { t } = useTranslation();
  const { permissions, isLoaded } = usePermissions();

  // Load permissions from localStorage on mount (for page refresh)
  useEffect(() => {
    console.log("SidebarMenuList - isLoaded:", isLoaded, "permissions:", permissions?.length);
    if (!isLoaded) {
      loadPermissionsFromStorage();
    }
  }, [isLoaded, permissions]);

  // Filter menu items based on user permissions
  const filteredMenuList = useMemo(() => {
    console.log("=== SIDEBAR MENU FILTERING ===");
    console.log("Permissions count:", permissions?.length || 0);
    console.log("All permissions:", permissions);
    
    // If no permissions loaded yet, show all items (for admin/dev mode)
    if (!permissions || permissions.length === 0) {
      console.log("⚠️ No permissions found, showing all menu items");
      return MenuList;
    }

    const filtered = MenuList.map((mainMenu) => {
      console.log(`Processing section: ${mainMenu.title}`);
      
      // Filter items that user has view access to
      const filteredItems = mainMenu.Items?.filter((item) => {
        // Skip items without a path - hide them
        if (!item.path) {
          console.log(`  ${item.title}: No path defined, HIDING`);
          return false;
        }
        
        // Clean the item path for matching
        let cleanPath = item.path.replace(process.env.PUBLIC_URL || "", "");
        if (!cleanPath.startsWith("/")) {
          cleanPath = "/" + cleanPath;
        }
        
        // Find permission by matching ModulePath
        const permission = permissions.find(p => {
          let modulePath = p.ModulePath || "";
          if (!modulePath.startsWith("/")) {
            modulePath = "/" + modulePath;
          }
          return modulePath.toLowerCase() === cleanPath.toLowerCase();
        });
        
        // If no permission found for this path, HIDE it
        if (!permission) {
          console.log(`  ${item.title}: No permission found for path "${cleanPath}", HIDING`);
          return false;
        }
        
        const hasAccess = permission.IsView === true;
        console.log(`  ${item.title}: path="${cleanPath}", ModulePath="${permission.ModulePath}", IsView=${permission.IsView}, hasAccess=${hasAccess}`);
        return hasAccess;
      });

      return {
        ...mainMenu,
        Items: filteredItems,
      };
    }).filter((mainMenu) => mainMenu.Items && mainMenu.Items.length > 0); // Remove sections with no items
    
    console.log("Filtered sections:", filtered.map(m => `${m.title} (${m.Items?.length} items)`));
    console.log("=== END SIDEBAR FILTERING ===");
    return filtered;
  }, [permissions]);

  const shouldHideMenu = (mainMenu: MenuItem) => { 
    return mainMenu?.Items?.map((data) => data.title).every((titles) => pinedMenu.includes(titles || "")); 
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {filteredMenuList &&
        filteredMenuList.map((mainMenu: MenuItem, index: number) => {
          const isExpanded = expandedSections[mainMenu.title || ""] ?? false;
          return (
            <Fragment key={index}>
              <LI className={`sidebar-main-title ${shouldHideMenu(mainMenu) ? "d-none" : ""}`}>
                <div
                  className="d-flex align-items-center justify-content-between w-100 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSection(mainMenu.title || "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSection(mainMenu.title || "");
                    }
                  }}
                >
                  <H6 className={`mb-0 flex-grow-1 text-truncate ${mainMenu.lanClass || ""}`}>{t(mainMenu.title)}</H6>
                  <span
                    className="sidebar-chevron-icon ms-2 flex-shrink-0"
                    style={{ fontSize: "12px", lineHeight: 1, opacity: 0.9, color: "#fff" }}
                    aria-hidden
                  >
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </LI>
              <UL
                className="sidebar-submenu-collapse list-unstyled"
                style={{
                  maxHeight: isExpanded ? "2000px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.35s ease-in-out, opacity 0.25s ease-in-out",
                  opacity: isExpanded ? 1 : 0,
                  margin: 0,
                  padding: 0,
                }}
              >
                <Menulist menu={mainMenu.Items} activeMenu={activeMenu} setActiveMenu={setActiveMenu} level={0} />
              </UL>
            </Fragment>
          );
        })}
    </>
  );
}

export default SidebarMenuList