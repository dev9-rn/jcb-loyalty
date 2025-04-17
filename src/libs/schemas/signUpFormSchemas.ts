import { TFunction } from "i18next";
import { z } from "zod";

const createSchema = (t: TFunction<"translation", undefined>) => {
    const baseSchema = z.object({
        userType: z.enum([
            t("login.distributor"),
            t("login.mechanic"),
            t("login.retailer")
        ]),
        userName: z.string()
            .nonempty(t("signup.validation.nameRequired"))
            .refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""), {
                message: t("signup.validation.nameOnlyLetters")
            }),
        userPhoneNumber: z.string()
            .nonempty(t("signup.validation.phoneRequired"))
            .min(10, { message: t("signup.validation.phoneInvalid") })
            .max(10, { message: t("signup.validation.phoneInvalid") })
            .refine((value) => /^\d{10}$/.test(value), {
                message: t("signup.validation.validPhone")
            }),
        userPincode: z.string()
            .nonempty(t("signup.validation.pincodeRequired"))
            .min(6, { message: t("signup.validation.pincodeInvalid") })
            .max(6, { message: t("signup.validation.pincodeInvalid") })
            .refine((value) => /^\d+$/.test(value), {
                message: t("signup.validation.validPincode")
            }),
        userCountry: z.object({
            id: z.string().nonempty(t("signup.validation.selectCountry")),
            name: z.string().nonempty(t("signup.validation.selectCountry")),
        }),
        userState: z.object({
            id: z.string().nonempty(t("signup.validation.selectState")),
            name: z.string().nonempty(t("signup.validation.selectState")),
        }),
        userCity: z.object({
            id: z.string().nonempty(t("signup.validation.selectCity")),
            name: z.string().nonempty(t("signup.validation.selectCity")),
        }),
    });

    const distributorSchema = baseSchema.extend({
        userType: z.literal(t("login.distributor")),
        distributorEmail: z.string()
            .nonempty(t("signup.validation.emailRequired"))
            .email({ message: t("signup.validation.emailInvalid") }),
        distributorAddress: z.string().nonempty(t("signup.validation.addressRequired")),
        distributorCompanyName: z.string(),
        distributorStreetAddress: z.string({
            required_error: t("signup.validation.streetRequired")
        }).nonempty(t("signup.validation.streetRequired")),
        distributorPanNumber: z.string()
            .optional()
            .refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
                message: t("signup.validation.invalidPAN")
            }),
        distributorGstNumber: z.string(),
        distributorBrand: z.object({
            id: z.string().nonempty(t("signup.validation.selectBrand")),
            name: z.string().nonempty(t("signup.validation.selectBrand")),
        })
    });

    const mechanicSchema = baseSchema.extend({
        userType: z.literal(t("login.mechanic")),
        mechanicPanNumber: z.string()
            .nonempty(t("signup.validation.panRequired"))
            .refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
                message: t("signup.validation.invalidPAN")
            }),
    });

    const retailerSchema = baseSchema.extend({
        userType: z.literal(t("login.retailer")),
        retailerShopName: z.string().nonempty(t("signup.validation.shopNameRequired")),
        retailerCode: z.string({
            required_error: t("signup.validation.codeRequired")
        }).nonempty(t("signup.validation.codeRequired")),
        retailerAddress: z.string().nonempty(t("signup.validation.addressRequired")),
    });

    const signUpForm = z.discriminatedUnion("userType", [
        distributorSchema,
        mechanicSchema,
        retailerSchema
    ]);

    return signUpForm;
};

export { createSchema };
