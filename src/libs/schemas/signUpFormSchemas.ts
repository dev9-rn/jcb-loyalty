import { z } from "zod";

const baseSchema = z.object({
    userType: z.enum(["distributor", "mechanic", "retailer"]),
    userName: z.string().nonempty("Please enter your full name").refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""), {
        message: "Name should only contain letters"
    }),
    userPhoneNumber: z.string().nonempty("Please enter your phone number").min(10, {
        message: "Please enter a 10 digit phone number"
    }).max(10, {
        message: "Please enter a 10 digit phone number"
    }).refine((value) => /^\d{10}$/.test(value), {
        message: "Enter a valid 10-digit phone number"
    }),
    userPincode: z.string().nonempty("Please enter a pincode").min(6, {
        message: "Please enter a 6 digit pincode",
    }).max(6, {
        message: "Please enter a 6 digit pincode",
    }).refine((value) => /^\d+$/.test(value), {
        message: "Please enter a valid 6-digit pincode"
    }),
    userCountry: z.object({
        id: z.string().nonempty("Please select a country"),
        name: z.string().nonempty("Please select a country"),
    }),
    userState: z.object({
        id: z.string().nonempty("Please select a state"),
        name: z.string().nonempty("Please select a state"),
    }),
    userCity: z.object({
        id: z.string().nonempty("Please select a city"),
        name: z.string({
            message: "Please select a city"
        }).nonempty(),
    }),
});

const distributorSchema = baseSchema.extend({
    userType: z.literal("distributor"),
    distributorEmail: z.string().nonempty("Please enter a email address").email({
        message: "Please enter a valid email address"
    }),
    distributorAddress: z.string().nonempty("Please enter you full address"),
    distributorCompanyName: z.string(),
    distributorStreetAddress: z.string({
        required_error: "Please enter your street name"
    }).nonempty(),
    distributorPanNumber: z.string()
        .optional()
        .refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
            message: "Please enter a valid PAN Number"
        }),
    distributorGstNumber: z.string(),
    distributorBrand: z.object({
        id: z.string(7).nonempty("Please select a brand"),
        name: z.string().nonempty("Please select a brand"),
    })
});

const mechanicSchema = baseSchema.extend({
    userType: z.literal("mechanic"),
    mechanicPanNumber: z.string().nonempty("Please enter a PAN Number").refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
        message: "Please enter a valid PAN Number"
    }),
});

const retailerSchema = baseSchema.extend({
    userType: z.literal("retailer"),
    retailerShopName: z.string().nonempty("Please enter a shop name"),
    retailerCode: z.string({
        required_error: "Please enter a code."
    }).nonempty("Please enter a code.")
});

const signUpForm = z.discriminatedUnion("userType", [
    distributorSchema,
    mechanicSchema,
    retailerSchema
]);

export { signUpForm }