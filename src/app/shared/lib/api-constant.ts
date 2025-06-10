/**
 * @export
 * @class AppEndPoint
 */

export namespace UserEndPoint {

    export abstract class PortalProfile {
        public static GET_ = 'portal/';
        public static GET_KEY_REFERENCE_NUMBER = 'portal/profile/getKeyReferenceSettings';
        public static SET_KEY_REFERENCE_NUMBER = 'portal/profile/setKeyReferenceSettings';
        public static GET_SAVED_FILTERS = 'portal/profile/getSavedFilters';
        public static SET_SAVED_FILTERS = 'portal/profile/setSavedFilters';
        public static GET_ETA_THRESHOLD_FILTERS = 'portal/profile/getEtaThreshold';
        public static SET_ETA_THRESHOLD_FILTERS = 'portal/profile/saveEtaThreshold';
        public static SET_USER_SAVED_COLUMN_SEQUENCE = 'portal/profile/setSavedColumnSequence';
        public static GET_USER_SAVED_COLUMN_SEQUENCE = 'portal/profile/getSavedColumnSequence';

        public static GET_STATUS_CONFIGURATION = 'portal/profile/getStatusConfiguration';
        public static SAVE_STATUS_CONFIGURATION = 'portal/profile/saveStatusConfiguration';

        public static GET_PORT_CONFIGURATION = 'portal/profile/getPortConfiguration';
        public static SAVE_PORT_CONFIGURATION = 'portal/profile/savePortConfiguration';
        
    }


    export abstract class FiltersPoints {
        public static readonly PORTS = '';
        public static readonly PERIODS = '';
        public static readonly STATUS = '';
        public static readonly CARRIER_NAMES = '';
        public static readonly DRAY_PROVIDERS = '';
        public static readonly CONTAINER_TYPES = '';
        public static readonly SHIP_FROM_LOCATIONS = '';
        public static readonly DELIVERY_LOCATIONS = '';
        public static readonly DATE_RANGES = '';
    }


    export abstract class ContainerSubscriptionRouting {
        public static readonly CONTAINER_SUBSCRIPTION = "container/subscribe/containerTracking";
        public static readonly CONTAINER_ROUTE_INFO = "container/routeInfo";
        public static readonly CONTAINER_COVERED_ROUTE = "container/route";
    }

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

    export abstract class StaticUrls {
        public static readonly WATERMARK_IMAGE = "http://manvendravidyamandir.in/BDP.png";
        public static readonly NOTE_IMAGE = "http://manvendravidyamandir.in/BDP_note.png";
    }

    export abstract class CommonService {
        public static readonly COMPANY = "common/company";
        public static readonly COMPANY_USER = "common/getCompanyByUser";
        public static readonly BDP_REPRESENTATIVE_NAME = "common/bdpRepresentativeName";
        public static readonly CUSTOMER_SERVICE_REPRESENTATIVE = "common/customerServiceRepresentatives";
        public static readonly BDP_SBUS = "common/sbus";
        public static readonly SERVICE_CODE = "common/serviceCode";
        public static readonly METHOD_OF_TRANSPORT_CODE = "common/mots";
        public static readonly CARGO_TYPES = "common/cargoType";
        public static readonly CARRIERS = "common/carriers";
        public static readonly VESSLES = "common/vessles";
        public static readonly PLACE_OF_RECEIPT = "common/placeOfReceipt";
        public static readonly PLACE_OF_DELIVERY = "common/placeOfDelivery";
        public static readonly ALERTS_LIST = "common/alerts";
        public static readonly EVENTS_LIST = "common/events";
        public static readonly POD = "common/POD";
        public static readonly POA = "common/POA";
        public static readonly MASTER_EVENTS = "common/masterEvents";
        public static readonly COUNTRY_REGION = "common/getRegion";
        public static readonly COUNTRY = "common/getCountry";
        public static readonly DOWNLOAD_USER_MANUAL = "common/getDocument";
        public static readonly ORIGIN_REGION_COUNTRY_POD = "common/portOfDepatureList";
        public static readonly DESTINATION_REGION_COUNTRY_POA = "common/portOfArrivalList";
        public static readonly ORIG_REGION_COUNTRY = "common/getRegionCountryList";




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

    export abstract class Shipments {
        public static readonly SHIPMENT_LIST = "shipments/shipmentList";
        //US 2851 In Transit List not showing all shipments on multi-shipment Vessel
        public static readonly VESSEL_SHIPMENT_LIST = "shipments/vesselShipmentList";

        public static readonly SHIPMENT_SEARCH = "shipments/shipmentSearch";
        // public static readonly SHIPMENT_DETAILS = "shipments/shipmentDetails" DELETED
        public static readonly SHIPMENT_INDICATORS = "shipments/shipmentTypeIndicators";
        public static readonly SHIPMENT_RESULT = "shipments/shipmentResult";
        public static readonly SHIPMENT_METRICS_SUMMARY = "shipments/shipmentMetricsSummary";
        public static readonly HARD_EXCEPTIONS_RESULT = "shipments/hardExceptionResult";
        public static readonly RECENTLY_VIEWED_SHIPMENTS = "shipments/recentlyViewedShipment";
        public static readonly DOWNLOAD_TRACKING_LIST = "shipments/downloadShipmentResult";
    }

    export abstract class Tracking {
        public static readonly TIMELINE_DETAILS = "tracking/timeline";
        public static readonly SCHEDULE_DETAILS = "tracking/scheduleNewType";
        public static readonly SHIPMENT_INFO = "tracking/shipmentInfo";
        public static readonly ROUTE_INFO = "tracking/routeInfo";
        public static readonly LOCATION_INFO = "tracking/location";
        public static readonly EVENTS_INFO = "tracking/eventNew";
        public static readonly PORT_OF_CALL = "tracking/portOfCall";
        public static readonly VALIDATE_USER = "tracking/validateUser";

    }

    export abstract class smartDocuments {
        public static readonly DMS_DOCUMENT = "smartDocuments/fetchDoc";
        public static readonly HAS_DOCUMENT = "smartDocuments/hasDocument";
        public static readonly CALL_DOCUMENT = "smartDocuments/callDMSServer";
        public static readonly DOCUMENT_TYPES = "smartDocuments/getDocumentList";
        public static readonly DOCUMENT_DISTRIBUTION_LIST = "smartDocuments/getDocDistributionList";

    }

    export abstract class UserPortal {
        public static readonly GET_ETA_THRESHOLD = "portal/profile/getEtaThreshold";
        public static readonly SET_ETA_THRESHOLD = "portal/profile/saveEtaThreshold";
        public static readonly GET_KEY_REFERENCE_SETTINGS = "portal/profile/getKeyReferenceSettings";
        public static readonly SET_KEY_REFERENCE_SETTINGS = "portal/profile/setKeyReferenceSettings";
        public static readonly GET_SAVED_FILTERS = "portal/profile/getSavedFilters";
        public static readonly SET_SAVED_FILTERS = "portal/profile/setSavedFilters";
        public static readonly GET_USER_LIST = "portal/user/getAllUsers";
        public static readonly GET_QLIK_TOKEN = "portal/user/getQlikToken";
        public static readonly GET_THOUGHT_SPOT_CONFIG = "portal/user/getThoughtspotConfig";

    }

    export abstract class Favorite {
        public static readonly GET_FAVORITE_WITH_DETAILS = "portal/user/getFavoriteDetails";
        public static readonly GET_USER_FAVORITE = "portal/profile/getFavorites";
        public static readonly SET_FAVORITE = "portal/profile/addFavorites";
        public static readonly REMOVE_FAVORITE = "portal/profile/removeFavorites";
        public static readonly UPDATE_FAVORITE_WIDGET = "portal/profile/updateFavPin";
    }

    export abstract class Alert {
        public static readonly GET_USER_ALERTS = "portal/alerts/getAlertsForUser";
        public static readonly ALERT_COUNT = "portal/alerts/getNewAlertCount";
        public static readonly ADD_ALERT = "portal/alerts/addAlerts";
        public static readonly REMOVE_ALERT = "portal/alerts/removeAlerts";
        public static readonly MARK_US_READ = "portal/alerts/markAsRead";
        public static readonly DE_NOTIFY = "portal/alerts/deNotify";
        public static readonly GET_ALERTS = "portal/alerts/getAlerts";
        public static readonly GET_ALERTS_SHIPMENT = "portal/alerts/getShipmentAlerts";
        public static readonly MARK_ALL_US_READ = "portal/alerts/alertTypes/markAllAsRead";
    }

    export abstract class Exception {
        public static readonly GET_EXCEPTION_STATISTICS = "exception/statistics";
        public static readonly GET_EXCEPTION_LIST = "exception/list";
        public static readonly UPDATE_EXCEPTION_STATUS = "exception/update/status";
        public static readonly DOWNLOAD_EXCEPTION_FILE = "exception/download";
        public static readonly GET_EXCEPTION_FILTER_OPTIONS = "exception/exceptionMasterFilterOptions"
    }

    export abstract class ThirdPartyExceptionManager {
        public static readonly GET_3PL_EXCEPTION_STATISTICS = "exception3pl/statistics";
        public static readonly GET_3PL_EXCEPTION_LIST = "exception3pl/list";
        public static readonly UPDATE_3PL_EXCEPTION_STATUS = "exception3pl/update/status";
        public static readonly DOWNLOAD_3PL_EXCEPTION_FILE = "exception3pl/download";
        public static readonly GET_3PL_EXCEPTION_FILTER_OPTIONS = "exception3pl/exceptionMasterFilterOptions3pl"
    }

    export abstract class ChatGpt {
        public static readonly GET_CHATGPT_RESPONSE = "chatBot";
        public static readonly GET_LEX_RESPONSE = "navgpt/getChatResponse";
    }
}
//Related to existing Admin Endpoints for DND
export namespace AdminEndPoint {

    export abstract class AlertSubscription {
        public static readonly ALERT_SUBSCRIPTION = "alert-subscription"
        public static readonly GET_USER_ALERTS = AlertSubscription.ALERT_SUBSCRIPTION + "/bulk";
        public static readonly SAVE_UPDATE_USER_ALERT = AlertSubscription.ALERT_SUBSCRIPTION + "/save";
        public static readonly DELETE_USER_ALERT = AlertSubscription.ALERT_SUBSCRIPTION + "/delete";
    }

    export abstract class UserManagement {
        public static readonly GET_USERS = "user-managment/users";
        public static readonly GET_USER_CONFIG = "getConfig";
        public static readonly UPDATE_USERS = "admin/updateUser";
        public static readonly USERS_FEATURE = "admin/company/feature/list";
        public static readonly USERS_COMPANIES = "user-managment/users/getPsaCompany";
        public static readonly NON_PSA_COMPANIES = "user-managment/users/getNonPsaCompany";
        public static readonly SAVE_UPDATE_COMPANIES = "admin/company/saveOrUpdate";
        public static readonly SAVE_UPDATE_FEATURE = "admin/company/feature/saveOrUpdate";
        public static readonly SET_EULA = "setEula";
        public static readonly SAVE_USER_COMPANY = "user-managment/users/save-companyAssociatedUser";
        public static readonly IS_BDP_EMPLOYEE = "isBdpEmployee";
        public static readonly REGISTER_USER = "register";
        public static readonly USERS = "lspList";
        public static readonly USER_ROLE="user-managment/user/roleGranted";
        public static readonly USERS_TYPE = UserManagement.GET_USERS + "/" + "getUserType";
        public static readonly USERS_CONFIG =  "user-role-feature-privilege/get-user-config";
    }
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


    export abstract class UserAbstract {
        public static readonly ROOT = "user";
        public static readonly PROFILE = "profile";
        public static readonly CHANGE_PASSWORD = "change-password";
        public static readonly NOT_ASSOCIATED = "not-association";
        public static readonly COMMON_PANEL = "common";
        public static readonly USER_CONFIG = "assign";
        public static readonly DYNAMIC_USER_CONFIG = UserAbstract.USER_CONFIG + "/:token";
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

    export abstract class UserFull {
        public static readonly ROOT = "/" + UserAbstract.ROOT;
        public static readonly NOT_ASSOCIATED = "/" + UserAbstract.NOT_ASSOCIATED;
        public static readonly NOT_FOUND = UserFull.ROOT + "/" + AuthAbstract.NOT_FOUND;
        public static readonly PAGE_BREAK = UserFull.ROOT + "/" + AuthAbstract.PAGE_BREAK;
        public static readonly PROFILE = UserFull.ROOT + "/" + UserAbstract.PROFILE;
        public static readonly CHANGE_PASSWORD = UserFull.PROFILE + "/" + UserAbstract.CHANGE_PASSWORD;
        public static readonly COMMON_CHANGE_PASSWORD = UserFull.PROFILE + "/" + UserAbstract.CHANGE_PASSWORD;
    }

    export abstract class Manager {
        public static readonly ROOT = "app";
        public static readonly HOME = "home";

    }

   

    export abstract class ReleaseNotes {
        public static GET_RELEASE_NOTES = 'release/getReleaseNotes';
        public static GET_RELEASE_NOTES_BY_ID = 'release/getReleaseNotesById';
        public static UPLOAD_RELEASE_NOTES = 'release/releaseNotesUpload';
    }
}
//Only for DND Portal  endpoints
export namespace DndPortalPoint {
    export const DndCommonEndppoint = {
        "ORIGIN_REGION":"common/region",
        "DESTINATION_REGION":"common/region",
        "PORTS": "common/ports",
        "CONTAINER": "common/container-types",
        "CARRIER": "common/carriers",
        "REPRESENTATIVE": "common/bdp-representative-name",
        "COMPANIES": "common/companies-by-user",
        "ALL_COMPANIES": "common/all-companies",
        "CURRENCY": "common/currencies",
        "PORT_LIST": "common/hierarchy/port-list",
        "FILTER_PAGE": "filterpanel"

    }

    export const DndContractCreationPoint = {
        "SAVE_UPDATE_CONTRACT": "contract-creation/contracts/send-for-approval",
        "SAVE_AS_DRAFT": "contract-creation/contracts/save-contract-draft",
        "GET_CONTRACT_DETAILS_FROM_STATUS": "contract-creation/contracts/by-company-and-status",
        "GET_CONTRACT_DRAFTS": "contract-creation/contracts/drafts",
        "GET_DETAILED_LOGS": "contract-creation/contracts/audit-log-detail",
    }

    export const DndContractUploadPoint = {
        "UPLOAD_CONTRACT_CSV": "contract-csv/upload-contracts-csv",
        "GET_CSV_HISTORY": "contract-csv/fetch-contracts-csv",
        "DOWNLOAD_ERROR_LOG": "contract-csv/download-error-log",
        "DOWNLOAD_CSV_FILE": "contract-csv/download-csv",
    }

    export const DndHomePagePoint = {
        "GET_PORT_CARRIER_CHART_DATA": "getPortCarrierChart",
        "GET_KPI_DATA": "getKpiList",
        "GET_WEEK_CHART_DATA": "getdemurrageByWeek",
        "GET_PORT_ON_MAP": "getPortMap",
        "GET_MASTER_KPI_DATA": "get-kpimaster",
        "UPDATE_USER_KPI_MAPPING": "save-kpiwidget",
    }

    export const DndContractApprovalPoint = {
        "APPROVE_REJECT_CONTRACT": "contract-approval/contracts/action",
        "GET_CONTRACTS": "contract-approval/contracts",
    }

    export const DndAlertPoint = {
        "GET_USER_ALERTS": "alert-subscription/bulk",
        "SAVE_UPDATE_USER_ALERT": "alert-subscription/save",
        "DELETE_USER_ALERT": "alert-subscription/delete",

    }
    export const ListView = {
        "GET_LIST_VIEW": "List-View/get-listView",
        "SET_SAVED_FILTERS" : "List-View/set-SavedFilters",
        "GET_SAVED_FILTERS" : "List-View/get-SavedFilters",
        "SET_FAOURITE" : "List-View/addUpdateFavorites",
        "GET_FAVOURITE" : "List-View/get-favourite",
        "SET_USER_SAVED_COLUMN_SEQUENCE" : "List-View/setSavedColumnSequence",
        "GET_USER_SAVED_COLUMN_SEQUENCE" : "List-View/getSavedColumnSequence",

    }
    export abstract class UserApi {
        public static readonly GET_USERS = "api/v1/user";
        public static readonly APP_USERS = "api/app/v1";
        public static readonly GET_USERS_PUBLIC = "public/users";
        public static readonly GET_GLOBAL_API = "api/app/v1";
        public static readonly REGISTRATION = "public/user/registration";

        public static readonly GET_USER_BY_EMAIL = UserApi.GET_USERS;
        public static readonly GET_CURRENT_USER = UserApi.GET_USERS + "/getUser";
        public static readonly ADD_USER = UserApi.GET_USERS;
        public static readonly UPDATE_USER = UserApi.GET_USERS;
        public static readonly UPDATE_USER_PROFILE = UserApi.GET_USERS + "/updateUserProfile";
        public static readonly GET_USER_APPS = UserApi.GET_USERS + "/getAssignedApps";
        public static readonly IS_PASSWORD_EXPIRED = UserApi.APP_USERS + "/isPwdExpired";
        public static readonly IS_APP_PERMITTED = UserApi.APP_USERS + "/isAppPermitted";
        public static readonly EULA_VALIDATE = UserApi.APP_USERS + "/eula/validate";
        public static readonly GET_ALL_APPS = UserApi.GET_GLOBAL_API + "/get-all-apps";
        public static readonly APP_HIT_LOG = UserApi.GET_GLOBAL_API + "/log-login";
    }

}
//To be used only when role-privilege is implemented
export namespace DndPortalFeaturesConstants {
    export const DndMenuFeaturesConstants = {
        "HOME": "home",
        "LIST_VIEW": "list-view",
        "ALERT_SUBSCRIPTION": "alert-subscription",
        "CONTRACT_AGREEMENT": "contract-agreement",
        "CONTRACT_AGREEMENT_CREATION": "contract-agreement-creation",
        "CONTRACT_AGREEMENT_APPROVAL": "contract-agreement-approval",
        "MASTER_DATA_MANAGEMENT": "master-data-management",
        "ROLE_MANAGEMENT": "role-management",
        "USER_MANAGEMENT": "user-management",
        "PORT_MASTER": "port-master",
        "COMPANY_MASTER": "company-master",
        "CURRENCY_MANAGEMENT": "currency-management",
        "FILTER_PAGE": "filterpanel"
    }
}


