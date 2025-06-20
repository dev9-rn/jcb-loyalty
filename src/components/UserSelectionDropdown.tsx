import React from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Text } from './ui/text';

type TLoginValue = {
    value: string;
    label: string;
}

type Props = {
    defaultLoginType: TLoginValue
    userLoginTypes: TLoginValue[]
    setSelectedSignInType: React.Dispatch<React.SetStateAction<TLoginValue>>;
}

const UserSelectionDropdown = ({ defaultLoginType, userLoginTypes, setSelectedSignInType }: Props) => {
    return (
        <Select
            className='capitalize'
            defaultValue={{ label: defaultLoginType.label, value: defaultLoginType.value }}
            onValueChange={(option) => {
                setSelectedSignInType({
                    label: option?.label as string,
                    value: option?.value as string
                })
            }}
        >
            <SelectTrigger >
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Login Type'
                />
            </SelectTrigger>
            <SelectContent className="w-full">
                <SelectGroup>
                    <SelectLabel>Select login type</SelectLabel>
                    {userLoginTypes.map((userLogin, i) => (
                        <SelectItem key={i} label={userLogin.label} value={userLogin.value}>
                            {userLogin.value}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select >
    )
}

export default UserSelectionDropdown