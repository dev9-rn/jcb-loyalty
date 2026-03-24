import { TFunction } from "i18next";
import { z } from "zod";


const createProfileUpdateForm = (t: TFunction<"translation", undefined>) => {

    const baseSchema = z.object({
        userName: z.string().nonempty(t("login.profile_distributor_name")).refine(
            (value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""),
            { message: t("signup.validation.nameOnlyLetters") }
        ),
        userPhoneNumber: z
            .string()
            .nonempty(t("login.profile_distributor_phnNo"))
            .min(10, { message: t("signup.validation.phoneInvalid") })
            .max(10, { message: t("signup.validation.phoneInvalid") })
            .refine((value) => /^\d{10}$/.test(value), {
                message: t("signup.validation.phoneInvalidFormat")
            }),
        userPincode: z
            .string()
            .nonempty(t("signup.validation.pincodeRequired"))
            .min(6, { message: t("signup.validation.pincodeInvalid") })
            .max(6, { message: t("signup.validation.pincodeInvalid") })
            .refine((value) => /^\d+$/.test(value), {
                message: t("signup.validation.pincodeDigits")
            }),
        userCountry: z.object({
            id: z.string().nonempty(t("signup.validation.countryRequired")),
            name: z.string().nonempty(t("signup.validation.countryRequired")),
        }),
        userState: z.object({
            id: z.string().nonempty(t("signup.validation.stateRequired")),
            name: z.string().nonempty(t("signup.validation.stateRequired")),
        }),
        userCity: z.object({
            id: z.string().nonempty(t("signup.validation.cityRequired")),
            name: z.string().nonempty(t("signup.validation.cityRequired")),
        }),
        distributorEmail: z
            .string()
            .nonempty(t("login.profile_distributor_email"))
            .email({ message: t("signup.validation.emailInvalid") }),
        distributorAddress: z.string().nonempty(t("signup.validation.addressRequired")),
        distributorCompanyName: z.string(),
        distributorStreetAddress: z
            .string({ required_error: t("signup.validation.streetRequired") })
            .nonempty(t("signup.validation.streetRequired")),
        distributorPanNumber: z
            .string()
            .refine(
                (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
                { message: t("signup.validation.panInvalid") }
            ),
        distributorGstNumber: z.string(),
        distributorBrand: z.object({
            id: z.string().nonempty(t("signup.validation.brandRequired")),
            name: z.string().nonempty(t("signup.validation.brandRequired")),
        }),
    });

    // const distributorSchema = baseSchema.extend({
    //     // userType: z.literal("distributor"),

    // });

    // const mechanicSchema = baseSchema.extend({
    //     // userType: z.literal("mechanic"),
    //     mechanicPanNumber: z
    //         .string()
    //         .nonempty(t("signup.validation.panRequired"))
    //         .refine(
    //             (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
    //             { message: t("signup.validation.panInvalid") }
    //         ),
    // });

    // const retailerSchema = baseSchema.extend({
    //     // userType: z.literal("retailer"),
    //     retailerShopName: z.string().nonempty(t("signup.validation.shopRequired")),
    // });

    return baseSchema
};

const createSignUpForm = (t: TFunction<"translation", undefined>) => {

    const baseSchema = z.object({
        userName: z.string().nonempty(t("login.profile_distributor_name")).refine(
            (value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""),
            { message: t("signup.validation.nameOnlyLetters") }
        ),
        userPhoneNumber: z
            .string()
            .nonempty(t("login.profile_distributor_phnNo"))
            .min(10, { message: t("signup.validation.phoneInvalid") })
            .max(10, { message: t("signup.validation.phoneInvalid") })
            .refine((value) => /^\d{10}$/.test(value), {
                message: t("signup.validation.phoneInvalidFormat")
            }),
        userPincode: z
            .string()
            .nonempty(t("signup.validation.pincodeRequired"))
            .min(6, { message: t("signup.validation.pincodeInvalid") })
            .max(6, { message: t("signup.validation.pincodeInvalid") })
            .refine((value) => /^\d+$/.test(value), {
                message: t("signup.validation.pincodeDigits")
            }),
        userCountry: z.object({
            id: z.string().nonempty(t("signup.validation.countryRequired")),
            name: z.string().nonempty(t("signup.validation.countryRequired")),
        }),
        userState: z.object({
            id: z.string().nonempty(t("signup.validation.stateRequired")),
            name: z.string().nonempty(t("signup.validation.stateRequired")),
        }),
        userCity: z.object({
            id: z.string().nonempty(t("signup.validation.cityRequired")),
            name: z.string().nonempty(t("signup.validation.cityRequired")),
        }),
        distributorEmail: z
            .string()
            .nonempty(t("login.profile_distributor_email"))
            .email({ message: t("signup.validation.emailInvalid") }),
        distributorAddress: z.string().nonempty(t("signup.validation.addressRequired")),
        distributorCompanyName: z.string(),
        distributorStreetAddress: z
            .string({ required_error: t("signup.validation.streetRequired") })
            .nonempty(t("signup.validation.streetRequired")),
        distributorPanNumber: z
            .string()
            .refine(
                (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
                { message: t("signup.validation.panInvalid") }
            ),
        distributorGstNumber: z.string(),
    });

    // const distributorSchema = baseSchema.extend({
    //     // userType: z.literal("distributor"),

    // });

    // const mechanicSchema = baseSchema.extend({
    //     // userType: z.literal("mechanic"),
    //     mechanicPanNumber: z
    //         .string()
    //         .nonempty(t("signup.validation.panRequired"))
    //         .refine(
    //             (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
    //             { message: t("signup.validation.panInvalid") }
    //         ),
    // });

    // const retailerSchema = baseSchema.extend({
    //     // userType: z.literal("retailer"),
    //     retailerShopName: z.string().nonempty(t("signup.validation.shopRequired")),
    // });

    return baseSchema
};


export { createProfileUpdateForm, createSignUpForm}