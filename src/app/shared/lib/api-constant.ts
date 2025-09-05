/**
 * @export
 * @class AppEndPoint
 */

export namespace UserEndPoint {

    export abstract class AuthPoints {
        public static readonly ADD_USER = "user/addUser";
        public static readonly FORGOT_PASSWORD = "user/forgot-password";
        public static readonly GET_USER_BY_ID = "user/getUserById";
        public static readonly LOGIN_USER = "user/loginUser";
        public static readonly RESET_PASSWORD = "user/resetPassword";
        public static readonly RESET_PASSWORD_LINK = "user/resetPasswordLink";
        public static readonly UPDATE_USER = "user/updateUser";
    }

}

export namespace AppEndPoints {
    export abstract class Home {
        public static readonly GET_COUNTRY_LIST = "home/map-data";
        public static readonly GET_KPIS_DATA = "home/kpi";
    }
}

export namespace AdminEndPoint {
    export abstract class RoleManagement {
        public static readonly GET_ROLE = "roles";
        public static readonly ROLE_LIST = RoleManagement.GET_ROLE + "/" + "all-details";
        public static readonly ROLE_LIST_DROPDOWN = RoleManagement.GET_ROLE + "/" + "get-roleDetails";
        public static readonly SAVE_UPDATE_ROLE_MANAGEMENT = RoleManagement.GET_ROLE;
        public static readonly ROLE_FEATURE_PRIVILEGE = RoleManagement.GET_ROLE + "/" + "get-featureDropdown";
        public static readonly SKINS = RoleManagement.GET_ROLE + "/" + "skins";
        public static readonly PRIVILEGE_HIERARCHY = RoleManagement.GET_ROLE + "/" + "privilege-hierarchy";
        public static readonly LANDING_PAGES = RoleManagement.GET_ROLE + "/" + "landing-pages";
    }

    export abstract class UserManagement {
        public static readonly GET_USER = "user-management";
        public static readonly GET_USER_LIST = UserManagement.GET_USER + "/" + "users";
        public static readonly GET_USER_ROLES = UserManagement.GET_USER + "/" + "roles";
        public static readonly GET_COMPANY_LIST = UserManagement.GET_USER + "/" + "company-tree";
        public static readonly GET_USER_COMPANY_LIST = UserManagement.GET_USER + "/" + "user-companies";
        public static readonly SAVE_UPDATE_USER_ROLE = UserManagement.GET_USER + "/" + "user-assignments";
        public static readonly GET_USER_ASSIGNED_COMPANIES = UserManagement.GET_USER + "/" + "user-assigned-companies";
    }

}

export namespace AppRoutes {
    export abstract class Auth {
        public static readonly LOGIN = "login";
        public static readonly LOGOUT = "logout";
        public static readonly ERROR = "error";
        public static readonly ACCESS = "access";
        public static readonly EULA = "end-user-license-agreement";
        public static readonly REGISTER = "register";
        public static readonly NOT_FOUND = "notfound";
        public static readonly RESEND_LINK = "resend-link";
        public static readonly RESET_PASSWORD = "reset-password";
        public static readonly FORGET_PASSWORD = "forget-password";
        public static readonly PASSWORD_CONFIRM = "password-confirm";
        public static readonly RESET_PASSWORD_AUTH = "reset-password-auth";
        public static readonly NOT_ASSOCIATED = "not-association";
    }

    export abstract class CustomerSubscription {
        public static readonly GET_COMPANY_SUBSCRIPTION_LIST = "customer-subscriptions/list";
        public static readonly UPDATE_CUSTOMER_SUBSCRIPTION_LIST = "customer-subscriptions/update";
        public static readonly GET_COMPANY_CONFIG = "customer-subscriptions/configs";
        public static readonly GET_COMPANY_SUBSCRIPTION_COMPANIES = "customer-subscriptions/companies";
        public static readonly UPDATE_CUSTOMER_SUBSCRIPTION_THROUGH_COPY = "customer-subscriptions/copy";
        public static readonly BULK_UPDATE_CUSTOMER_SUBSCRIPTION_TIER = "customer-subscriptions/bulk-update-tier";
    }

    export abstract class PetaPetdManagement {
        public static readonly GET_COMPANY_PETA_LIST = "peta-petd-management/list";
        public static readonly UPDATE_COMPANY_PETA_LIST = "peta-petd-management/update";
        public static readonly BULK_UPDATE_COMPANY_PETA_LIST = "peta-petd-management/bulk-update";
        public static readonly GET_COMPANY_PETA_CONFIG = "peta-petd-management/configs";
    }


    export abstract class User {
        public static readonly ROOT = "app";
        public static readonly HOME = "home";
        public static readonly LIST_VIEW = "list-view";
        public static readonly PROFILE = "profile";
        public static readonly STATUS_CONFIGURATION = User.PROFILE + '/' + "container-status-configuration";
        public static readonly PORT_CONFIGURATION = User.PROFILE + '/' + "port-configuration";
        // public static readonly HELP = "change-password";
        public static readonly OVERVIEW = "overview";
        public static readonly NOT_ASSOCIATED = "notAssociated";
        public static readonly HELP = "help";
        public static readonly MAINTENANCE = "maintenance";
        public static readonly CONTRACT_AGREEMENT = "contract-agreement";
        public static readonly CONTRACT_AGREEMENT_APPROVAL = User.CONTRACT_AGREEMENT + '/' + "contract-agreement-approval";
        public static readonly CONTRACT_AGREEMENT_CREATION = User.CONTRACT_AGREEMENT + '/' + "contract-agreement-creation";
        public static readonly ALERT_SUBSCRIPTION = "alert-subscription";
        public static readonly CONTRACT_CSV_UPLOAD = User.CONTRACT_AGREEMENT + '/' + "contract-csv-upload";
        public static readonly USER_MANAGEMENT_CONFIG = "user-configuration";
        public static readonly CONTRACT_CSV_HISTORY = User.CONTRACT_AGREEMENT + '/' + "contract-csv-history";
        public static readonly RELEASE_NOTES = User.PROFILE + '/' + "data-upload-download";
        public static readonly FILTER_PAGE = User.PROFILE + '/' + "filterpanel";
    }
    export abstract class AuthAbstract {
        public static readonly DOMAIN = '/';
        public static readonly ROOT = "auth";
        public static readonly SIGNIN = "signin";
        public static readonly SIGNUP = "signup";
        public static readonly ERROR = "error";
        public static readonly AUTH0_ERROR = "auth-error";
        public static readonly ACCESS = "access";
        public static readonly EULA = "end-user-license-agreement";
        public static readonly LOGOUT = "logout";
        public static readonly NOT_FOUND = "not-found";
        public static readonly PAGE_BREAK = "page-break";
        public static readonly APP_PAGE_BREAK = "app-page-break";
        public static readonly MAINTENANCE = "maintenance";
        public static readonly RESET_PASSWORD = "set-password";
        public static readonly GET_LINK = "get-link";
        public static readonly FORGET_PASSWORD = "forget-password";
        public static readonly REACTIVATE_ACCOUNT = "reactivate-account";
    }

    export abstract class Manager {
        public static readonly ROOT = "app";
        public static readonly HOME = "home";

    }


}
