//Login Screen
export const USER_LOGIN = "/api/login";
export const VERIFY_OTP = "/api/verifyOtp";

//Notification Alerts
export const IS_MAINTENANCE = '/api/getSiteStatus'
export const DISPLAY_NOTIFICATION_DASHBOARD = "/api/displayNotiOnLogDash"

//Home Screen / Dashboard Screen
export const GET_DASHBOARD_DATA = "/api/getDashboardV1";
export const CHECK_COUPON = "/api/checkCoupon";
export const REDEEM_COUPON = "/api/redeemCoupon";

//Profile
export const GET_DISTRIBUTOR_PROFILE = "/api/getDistributorProfile";
export const UPDATE_DISTRIBUTOR_PROFILE = "/api/updateProfile";
export const GET_BRANDS_BY_IDS = "/api/getBrands";
export const GET_COUNTRY_LIST = "/api/getCountries";
export const GET_CITIES_LIST = "/api/getCitiesByState";
export const GET_STATE_LIST = "/api/getStatesByCountry";
//COUPON HISTOY
export const GET_REDEEM_HISTORY = "/api/getRedeemHistory";
export const GET_DISTRIBUTOR_SCHEMES = "/api/getDistributorSchemes"
export const GET_DISTRIBUTOR_SCHEMES_DETAILS = "/api/getDistributorSchemesDetails"

export const REGISTER_DISTRIBUTOR = "/apiv1/register"
export const USER_LOGOUT = "/apiv1/logout";
export const POST_REPORT_COUPON = "/apiv1/reportCoupon";
export const GET_REPORTED_COUPON_HISTORY = "/apiv1/getReportedCouponHistory";
export const GET_CASH_BATCH_REPORTS = "/apiv1/getCashBatches";
export const GET_DEALERS_LIST = "/apiv1/getDealersList";
export const APPROVE_REJECT_DEALER = "/apiv1/approveRejectDealer"

/* 
** Mechanic URLs
*/
export const REGISTER_MECHANIC = "/apiv1/registerMechanic"
export const MECHANIC_LOGIN = "/apiv1/loginMechanic";
export const VERIFY_MECHANIC = "/apiv1/verifyOtpMechanic";
export const GET_MECHANIC_DASHBOARD = "/apiv1/getMechanicDashboard";
export const GET_MECHANIC_PROFILE = "/apiv1/getMechanicProfile";
export const REDEEM_MECHANIC_COUPON = "/apiv1/mechanicRedeemCouponV1";
export const UPDATE_MECHANIC_PROFILE = "/apiv1/updateProfileMechanic";
export const GET_MECHANIC_PASSBOOK = "/apiv1/getMechanicRedemptionPassbook"

// Retailer Login
export const REGISTER_RETAILER = "/apiv1/registerDealer"
export const RETAILER_LOGIN = "/apiv1/loginDealer";
export const VERIFY_RETAILER = "/apiv1/verifyOtpDealer";
export const GET_RETAILER_DASHBOARD = "/apiv1/getDashboardDealer"
export const GET_RETAILER_PROFILE = "/apiv1/getProfileDealer";
export const UPDATE_RETAILER_PROFILE = "/apiv1/updateProfileDealer";
export const GET_RETAILER_COUPON_HISTORY = "/apiv1/getScannedHistory";
export const SCAN_RETAILER_COUPON = "/apiv1/scanCoupon";
export const VERIFY_VALID_RETAILER = "/apiv1/verifyDealer";

// Common
export const DELETE_USER_ACCOUNT = "/api/removeAccount";
export const GET_USER_NOTIFICATIONS = "/api/getNotifications";
export const GET_USER_NOTIFICATIONS_COUNT = "/api/getNotificationsCount";
export const GET_FOC_COUPON_HISTORY = "/apiv1/getFOCBatches";