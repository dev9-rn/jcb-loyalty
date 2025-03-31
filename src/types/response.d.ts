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

interface IDashboardData {
    status: number;
    message: string;
    totalCouponsRedeemed: number;
    totalAmountRedeemed: number;
    totalCouponsRedeemedCash: number;
    totalCouponsRedeemedFOC: number;
};

interface IValidCoupon {
    status: number;  // 200
    message: string;  // "Coupon is valid."
    redeemMethods: {
        redeem_type: string;
        details: {
            value: string;
        };
    }[]
};

interface IRedeemedCoupon extends IValidCoupon {
    couponData: {
        id: string;
        po_no: string;
        item_code: string;
        item_description: string;
        brand_id: string;
        product_id: string | null;
        quantity: string;
        value: string;
        loyalty_points: string;
        start_date: string;  // Consider using Date if parsed
        end_date: string;    // Consider using Date if parsed
        redeem_types: string;
        coupon_type: string;
        brand_code: string;
        serial_no: string | null;
        created_date: string; // Consider using Date if parsed
        updated_date: string | null;
        publish: string;
        user_id: string;
        product_name: string;
    };
};

interface IRedeemedCoupon {
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
    scanned_date: string | null;
}

interface ICouponHistory {
    status: number;
    message: string;
    redeemHistory: IRedeemedCoupon[];
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
}