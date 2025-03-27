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
    }
}