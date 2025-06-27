interface IUserDetails {
    id: string;
    name: string;
    mobile: string;
    email: string;
    address: string;
    street: string;
    country_id: string;
    state_id: string;
    city_id: string;
    pincode: string;
    brand_id: string;
    sales_person_id: string;
    company_name: string;
    gst_no: string;
    pan_no: string;
    company_code: string;
    is_approved: string;
    created_date: string;
    brand_logo: string;
    accesstoken: string;
    userType: number;
};

interface IMechanicDetails {
    id: string;
    full_name: string;
    mobile_no: string;
    shop_name: string;
    retailer_name: string | null;
    distributor_name: string | null;
    state_id: string;
    country_id: string | null;
    city_id: string;
    pin_code: string;
    pan_no: string;
    payment_option: string;
    beneficiary_name: string | null;
    account_no: string | null;
    ifsc_code: string | null;
    paytm_reg_no: string | null;
    is_valid_payment_data_mobile: string;
    is_valid_payment_data_bank: string;
    payment_resp_msg: string | null;
    loyalty_points_wallet: string;
    publish: string;
    status: string;
    created_date: string;
    updated_date: string | null;
    accesstoken: string;
    userType: number;
};

interface IRetailerDetails {
    id: string;
    distributor_code: string;
    shop_name: string;
    dealer_name: string;
    mobile_no: string;
    address: string;
    state_id: string;
    city_id: string;
    pincode: string;
    is_verified: string;
    is_approved: string;
    is_active: string;
    created: string; // ISO Date string
    updated: string; // ISO Date string
    userType: number;
}

interface IDashboardData {
    status: number;
    message: string;
    totalCouponsRedeemed: number;
    totalAmountRedeemed: number;
    totalCouponsRedeemedCash: number;
    totalCouponsRedeemedFOC: number;
    totalBalancedPoint: string;
    totalCouponsRedeemedPoint: number;
    totalCouponsRedeemedCount: number;
    totalCouponsScanned: number;
    totalAmountCouponsScanned: number;
};

interface ICouponDetails {
    id: string;
    po_no: string;
    item_code: string;
    item_description: string | null;
    brand_id: string;
    product_id: string;
    quantity: string;
    value: string;
    loyalty_points: string | null;
    start_date: string;
    end_date: string;
    redeem_types: string;
    coupon_type: string;
    brand_code: string;
    serial_no: string | null;
    created_date: string;
    updated_date: string | null;
    publish: string;
    user_id: string;
    product_name: string;
};

interface IProductDetails {
    id: string;
    brand_id: string;
    product_name: string;
    product_code: string;
    product_value: string;
    product_type: string | null;
    publish: string;
    created_date: string;
    updated_date: string | null;
}

interface IValidCoupon {
    status: number;  // 200
    message: string;  // "Coupon is valid."
    redeemMethods: {
        redeem_type: string;
        details: {
            value: string;
        };
    }[],
    coupon_details: ICouponDetails;
    product_details: IProductDetails | undefined;
};

interface IRedeemedCoupon extends IValidCoupon {
    redeemMethods: {
        redeem_type: string;
        details: {
            value: string;
        } | {};
    }[],
    redeemedMethods: {
        redeem_type: string;
        details: {
            value: string;
        } | {};
    }[],
    couponData: ICouponDetails;
};

interface IRedeemedCouponDetails {
    id: string;
    coupon_id: string;
    item_code: string;
    brand_id: string;
    value: string;
    loyalty_points: string;
    start_date: string;
    end_date: string;
    serial_no: string;
    qr_text: string;
    serial_no_print: string;
    distributor_id: string;
    distributor_redemption_flag: string;
    distributor_redemption_date: string;
    distributor_redeemed_type: string;
    is_manual_redeem: string;
    user_id_redeem_by: string | null;
    user_type: string;
    batch_distirbutor_id: string | null;
    brand_code: string;
    created_date: string;
    publish: string;
    mechanic_id: string;
    mechanic_redeemption_date_time: string | null;
    scanned_by: string | null;
    scanned_date: string;
}

interface ICouponHistory {
    status: number;
    message: string;
    redeemHistory: IRedeemedCouponDetails[];
    scannedHistory: IRedeemedCouponDetails[];
    offset: number;
};

interface IReportedCoupon {
    id: string;
    distributor_id: string;
    user_type: string | null;
    coupon_image: string;
    sr_no: string;
    description: string;
    is_approved: "0" | "1";
    approval_date_time: string | null;
    approved_by: string | null;
    created: string;
}

interface IReportedCouponsHistory {
    status: number;
    message: string;
    reportedCouponHistory: IReportedCoupon[];
    offset: number;
};

interface IDistributorProfileDetails {
    address: string;
    brand_id: string;
    brand_logo: string;
    city_id: string;
    company_code: string;
    company_name: string;
    country_id: string;
    created_date: string;
    email: string;
    gst_no: string;
    id: string;
    is_approved: string;
    mobile: string;
    name: string;
    pan_no: string;
    pincode: string;
    sales_person_id: string;
    state_id: string;
    street: string;
};

interface ILocationData {
    id: string,
    name: string,
};

interface IBrandsDetails {
    id: string;
    name: string;
};

interface IMechanicPassbook {
    full_name: string;
    loyalty_points_wallet: string;
    reference_id: string;
    type: "credit" | "debit"; // Assuming it can only be "credit" or "debit"
    date: string; // Consider using `Date` if you'll parse it
    mechanic_id: string;
};

interface ICashBatchReports {
    batch_number: string;
    start_date: string;
    end_date: string;
    batch_id: string;
    total_coupons_scanned: string;
    total_amount: string;
    status: "Pending" | "Approved" | "Rejected"; // Adjust based on possible statuses
    credit_note_no: string | null;
    credit_note_date: string | null;
    credit_note_value: string | null;
};

interface IDealerListDetail {
    id: string;
    distributor_code: string;
    shop_name: string;
    dealer_name: string;
    mobile_no: string;
    address: string;
    state_id: string;
    city_id: string;
    pincode: string;
    is_verified: "0" | "1" | "2";
    is_approved: "0" | "1" | "2";
    is_active: "0" | "1" | "2";
    otp: string | null;
    created: string; // e.g., ISO date string
    updated: string | null;
    state: string;
    city: string;
};

interface INotificationHistory {
    id: string;
    title: string;
    notification: string;
    data_id: string | null;
    created_date: string; // You can change this to `Date` if you're parsing the string
};

interface IFOCCouponHistoryData {
    ar_date: string;
    ar_number: string;
    batch_number: string;
    product_code_name: string;
    total_cartons_dispatched: string;
    total_coupons: string;
    total_packs_dispatched: string;
}

interface IFocCouponsHistoryResponse {
    batchesData: IFOCCouponHistoryData[];
    message: string;
    status: number;
}