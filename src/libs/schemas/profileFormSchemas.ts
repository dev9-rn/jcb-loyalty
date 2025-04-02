import { z } from "zod";

const distributorFormSchema = z.object({
    distributorName: z.string().nonempty({
        message: 'Please enter your full name'
    }).refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""), {
        message: "Name should only contain letters"
    }),
    distributorPhoneNumber: z.string().nonempty({
        message: "Please enter your phone number",
    }).refine((value) => /^[0-9]{10}$/.test(value), {
        message: "Enter a valid 10-digit phone number"
    }),
    distributorEmail: z.string().nonempty({
        message: "Please enter your Email Address"
    }).email({
        message: "Please enter a valid e-mail address"
    }),
    distributorCompanyName: z.string(),
    distributorPanNumber: z.string().optional().refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
        message: "Please enter a valid PAN Number"
    }),
    distributorGstNumber: z.string(),
    distributorBrand: z.string().nonempty({
        message: 'Please select your brand'
    }),
    distributorStreet: z.string().nonempty({
        message: 'Please enter your street address'
    }),
    distributorPincode: z.string().nonempty({
        message: 'Please enter your pincode'
    }).refine((value) => /^[0-9]{6}$/.test(value), {
        message: "Please enter a valid 6-digit pincode"
    }),
    distributorAddress: z.string().nonempty({
        message: "Please enter your full address"
    }),
    distributorCountry: z.object({
        id: z.string().nonempty({
            message: "Please select your country"
        }),
        name: z.string({
            message: "Please select your country"
        })
    }),
    distributorState: z.object({
        id: z.string().nonempty({
            message: "Please select your state"
        }),
        name: z.string({
            message: "Please select your state"
        })
    }),
    distributorCity: z.object({
        id: z.string().nonempty({
            message: "Please select your city"
        }),
        name: z.string({
            message: "Please select your city"
        })
    }),
});

const mechanicFormSchema = z.object({
    mechanicName: z.string().nonempty({
        message: "Please enter your full name"
    }),
    mechanicPhoneNumber: z.string().nonempty({
        message: "Please enter your phone number",
    }).refine((value) => /^[0-9]{10}$/.test(value), {
        message: "Enter a valid 10-digit phone number"
    }),
    mechanicShopName: z.string().nonempty({
        message: "Please enter your shop name"
    }),
    mechanicPincode: z.string().nonempty({
        message: 'Please enter your pincode'
    }).refine((value) => /^[0-9]{6}$/.test(value), {
        message: "Please enter a valid 6-digit pincode"
    }),
    mechanicPanNumber: z.string().optional().refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
        message: "Please enter a valid PAN Number"
    }),
    distributorCountry: z.object({
        id: z.string().nonempty({
            message: "Please select your country"
        }),
        name: z.string({
            message: "Please select your country"
        })
    }),
    distributorState: z.object({
        id: z.string().nonempty({
            message: "Please select your state"
        }),
        name: z.string({
            message: "Please select your state"
        })
    }),
    distributorCity: z.object({
        id: z.string().nonempty({
            message: "Please select your city"
        }),
        name: z.string({
            message: "Please select your city"
        })
    }),
})


export {
    distributorFormSchema,
    mechanicFormSchema,
}
