import { useAppSelector } from "../ReduxToolkit/Hooks";
import { UserPermission } from "../ReduxToolkit/Reducers/PermissionsSlice";
import { API_HELPER } from "./ApiHelper";
import { API_WEB_URLS } from "../constants/constAPI";
import store from "../store";
import { setPermissions, setPermissionsLoading, clearPermissions } from "../ReduxToolkit/Reducers/PermissionsSlice";
import type { RootState } from "../store/types";

// Fetch permissions from API
export const fetchUserPermissions = async (roleId: number | string, branchId: number | string): Promise<UserPermission[]> => {
    try {
        store.dispatch(setPermissionsLoading(true));
        
        // Fetch permissions (now includes ModulePath directly)
        const FETCH_URL = `${API_WEB_URLS.BASE}${API_WEB_URLS.MASTER}/0/token/RoleWisePermissionByBranchRole/${branchId}/${roleId}`;
        console.log("=== PERMISSIONS FETCH ===");
        console.log("Fetching permissions from:", FETCH_URL);
        console.log("RoleId:", roleId, "BranchId:", branchId);
        
        const response = await API_HELPER.apiGET(FETCH_URL);
        console.log("Raw API Response:", JSON.stringify(response, null, 2));
        
        let permissions: UserPermission[] = [];
        
        // Handle response format: { time, success, status, message, data: { dataList: [...] } }
        if (response?.data?.dataList && Array.isArray(response.data.dataList)) {
            console.log("Found permissions in response.data.dataList");
            permissions = response.data.dataList;
        } else if (response?.dataList && Array.isArray(response.dataList)) {
            console.log("Found permissions in response.dataList");
            permissions = response.dataList;
        } else if (Array.isArray(response?.data)) {
            console.log("Found permissions in response.data (array)");
            permissions = response.data;
        } else if (Array.isArray(response)) {
            console.log("Found permissions in response (array)");
            permissions = response;
        } else {
            console.log("Could not find permissions array in response");
        }
        
        console.log("Parsed permissions count:", permissions.length);
        
        // Store in Redux
        store.dispatch(setPermissions(permissions));
        console.log("Permissions dispatched to Redux store");
        
        // Also store in localStorage for persistence
        localStorage.setItem("userPermissions", JSON.stringify(permissions));
        console.log("Permissions saved to localStorage");
        console.log("=== END PERMISSIONS FETCH ===");
        
        return permissions;
    } catch (error) {
        console.error("Failed to fetch user permissions:", error);
        store.dispatch(setPermissionsLoading(false));
        return [];
    }
};

// Load permissions from localStorage (on app reload)
export const loadPermissionsFromStorage = (): UserPermission[] => {
    try {
        console.log("=== LOADING FROM STORAGE ===");
        
        // Load permissions
        const storedPermissions = localStorage.getItem("userPermissions");
        if (storedPermissions) {
            const permissions = JSON.parse(storedPermissions) as UserPermission[];
            console.log("Loaded permissions from storage:", permissions.length, "items");
            store.dispatch(setPermissions(permissions));
            return permissions;
        } else {
            console.log("No permissions found in localStorage");
        }
    } catch (error) {
        console.error("Failed to load from storage:", error);
    }
    return [];
};

// Clear permissions on logout
export const clearUserPermissions = () => {
    store.dispatch(clearPermissions());
    localStorage.removeItem("userPermissions");
};

// Get permission for a specific module by moduleId
export const getModulePermission = (moduleId: number, permissions: UserPermission[]): UserPermission | undefined => {
    return permissions.find(p => p.F_ModuleMaster === moduleId);
};

// Get permission by path using ModulePath from permissions
export const getPermissionByModulePath = (path: string, permissions: UserPermission[]): UserPermission | undefined => {
    let cleanPath = path.replace(process.env.PUBLIC_URL || "", "");
    if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
    }
    return permissions.find(p => {
        let modulePath = p.ModulePath || "";
        if (!modulePath.startsWith("/")) {
            modulePath = "/" + modulePath;
        }
        return modulePath.toLowerCase() === cleanPath.toLowerCase();
    });
};

// Check if user has view access to a module
export const hasViewAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsView === true;
};

// Check if user has view access by path
export const hasViewAccessByPath = (path: string, permissions: UserPermission[]): boolean => {
    const perm = getPermissionByModulePath(path, permissions);
    return perm?.IsView === true;
};

// Permission check functions
export const hasAddAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsAdd === true;
};

export const hasEditAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsEdit === true;
};

export const hasDeleteAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsDelete === true;
};

export const hasApproveAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsApprove === true;
};

export const hasExportAccess = (moduleId: number, permissions: UserPermission[]): boolean => {
    const perm = getModulePermission(moduleId, permissions);
    return perm?.IsExport === true;
};

// Hook for using permissions in components
export const usePermissions = () => {
    const permissions = useAppSelector((state: RootState) => state.permissions?.permissions || []);
    const isLoaded = useAppSelector((state: RootState) => state.permissions?.isLoaded || false);
    
    // Get permission by path using ModulePath from permissions
    const getPermissionByPath = (path: string): UserPermission | undefined => {
        let cleanPath = path.replace(process.env.PUBLIC_URL || "", "");
        if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
        }
        return permissions.find(p => {
            let modulePath = p.ModulePath || "";
            if (!modulePath.startsWith("/")) {
                modulePath = "/" + modulePath;
            }
            return modulePath.toLowerCase() === cleanPath.toLowerCase();
        });
    };
    
    return {
        permissions,
        isLoaded,
        hasView: (moduleId: number) => hasViewAccess(moduleId, permissions),
        hasAdd: (moduleId: number) => hasAddAccess(moduleId, permissions),
        hasEdit: (moduleId: number) => hasEditAccess(moduleId, permissions),
        hasDelete: (moduleId: number) => hasDeleteAccess(moduleId, permissions),
        hasApprove: (moduleId: number) => hasApproveAccess(moduleId, permissions),
        hasExport: (moduleId: number) => hasExportAccess(moduleId, permissions),
        hasViewByPath: (path: string) => getPermissionByPath(path)?.IsView === true,
        getPermission: (moduleId: number) => getModulePermission(moduleId, permissions),
        getPermissionByPath,
    };
};
