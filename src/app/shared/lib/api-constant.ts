/**
 * @export
 * @class AppEndPoint
 */

export namespace UserEndPoint {

   




  

    export abstract class LeadTimePoints {
        public static readonly LEAD_TIME = "Leadtime";
        public static readonly DOWNLOAD_REPORT = "LeadTime/DownloadReport";
        public static readonly CAREER_RELIABILITY = "LeadTime/CareerReliability";
        public static readonly TRADE_LANE_CONTAINERS = "Leadtime/TradeLaneContainers";
    }

    export abstract class CongestionPoints {
        public static readonly PORT_CONGESTION_PERIOD = "PortOfCongestion/WorldMap";
        public static readonly ARRIVAL_DEPARTURE = "PortOfCongestion/ArrivalDeparture";
        public static readonly TIME_AT_ANCHORAGE_AND_PORT = "PortOfCongestion/TimeAtAnchorageAndPort";
        public static readonly TIME_AT_ANCHORAGE_AND_PORT_DIFF = "PortOfCongestion/TimeAtAnchorageAndPortDifference";
    }

    export abstract class AuthPoints {
        public static readonly ADD_USER = "user/addUser";
        public static readonly FORGOT_PASSWORD = "user/forgot-password";
        public static readonly GET_USER_BY_ID = "user/getUserById";
        public static readonly LOGIN_USER = "user/loginUser";
        public static readonly RESET_PASSWORD = "user/resetPassword";
        public static readonly RESET_PASSWORD_LINK = "user/resetPasswordLink";
        public static readonly UPDATE_USER = "user/updateUser";
    }

 

   
    export abstract class CodeData {

        // public static readonly BDP_SBUS = "common/sbus";
        // public static readonly SERVICE_CODE = "common/serviceCode";
        // public static readonly METHOD_OF_TRANSPORT_CODE = "common/mots";
        // public static readonly CARGO_TYPES = "common/cargoType";
        // public static readonly CARRIERS = "common/carriers";
        // public static readonly VESSLES = "common/vessles";
        // public static readonly PLACE_OF_RECEIPT = "common/placeOfReceipt";
        // public static readonly PLACE_OF_DEPARTURE = "common/placeOfDeparture";
        // public static readonly EXCEPTIONS_LIST = "common/exceptionsList";
    }

    
    
  


   
   
    
   
    
}
//Related to existing Admin Endpoints for DND
export namespace AdminEndPoint {

   

  
    export abstract class RoleManagement {
        public static readonly GET_ROLE = "role-management";
        public static readonly ROLE_LIST = RoleManagement.GET_ROLE + "/" + "get-roleDetails";
        public static readonly ROLE_LIST_DROPDOWN = RoleManagement.GET_ROLE + "/" + "get-roleDetails";
        public static readonly SAVE_ROLE_MANAGEMENT = RoleManagement.GET_ROLE + "/" + "role/save-role-management";
        public static readonly UPDATE_ROLE_MANAGEMENT = RoleManagement.GET_ROLE + "/" + "role/update-role-management";
        public static readonly ROLE_FEATURE_PRIVILAGE = RoleManagement.GET_ROLE + "/" + "get-featureDropdown";
    }
    export abstract class PortManagement {
        public static readonly GET_PORT = "port";
        public static readonly PORT_GETAILS = PortManagement.GET_PORT + "/" + "get-viewPortDetails";

    }
    export abstract class CurrencyManagement {
        public static readonly GET_CURRENCY = "currency";
        public static readonly CURRENCY_LIST = CurrencyManagement.GET_CURRENCY + "/" + "get-viewCurrencyDetails";
        public static readonly UPDATE_CURRENCY = CurrencyManagement.GET_CURRENCY + "/" + "update-currency";

    }
    export abstract class CommanyManagement {
        public static readonly GET_COMPANY = "companies";
        public static readonly UPDATE_COMPANY = CommanyManagement.GET_COMPANY +"/"+ "update-company";     
        public static readonly PSA_COMPANIES = "companies/users/getPsaCompany";
        public static readonly NON_PSA_COMPANIES = "companies/users/getNonPsaCompany";

    }

    export abstract class Cache {
        public static readonly CACHE_COMPANY = "cache/clearCacheCompanyListForUser";
    }

    export abstract class Ump {
        public static readonly UMP= "ump";
        public static readonly GET_ALL_USER = Ump.UMP+"/"+"user/allUsers";
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
        public static readonly MASTER_DATA_MANAGEMENT = "master-management";
        public static readonly ROLE_MANAGEMENT = User.MASTER_DATA_MANAGEMENT + '/' + "role-management";
        public static readonly ALERT_SUBSCRIPTION = "alert-subscription";
        public static readonly CONTRACT_CSV_UPLOAD = User.CONTRACT_AGREEMENT + '/' + "contract-csv-upload";
        public static readonly USER_MANAGEMENT = User.MASTER_DATA_MANAGEMENT + '/' + "user-control";
        public static readonly USER_MANAGEMENT_CONFIG = User.MASTER_DATA_MANAGEMENT + '/' + "user-configuration";
        public static readonly CURRENCY_MANAGEMNT = User.MASTER_DATA_MANAGEMENT + '/' + "currency-management";
        public static readonly PORT_MASTER_DATA_MANAGEMENT = User.MASTER_DATA_MANAGEMENT + '/' + "port-masterdata-management";
        public static readonly COMPANY_MANAGEMENT = User.MASTER_DATA_MANAGEMENT + '/' + "company-management";
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
//Only for DND Portal  endpoints

//To be used only when role-privilege is implemented



