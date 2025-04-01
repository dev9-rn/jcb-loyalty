import { FlatList, Platform, TextInput, View } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollView } from 'react-native-gesture-handler';
import { Input } from './ui/input';

type Props = {
    onValueChange: (...event: any[]) => void,
    setSelectedCountry: Dispatch<SetStateAction<ILocationData | undefined>>
    countryList: ILocationData[]
    userDefaultCountryId?: string | undefined;
}

const CountryDropdown = ({ countryList, setSelectedCountry, onValueChange, userDefaultCountryId }: Props) => {

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [userDefaultValue, setUserDefaultValue] = useState<ILocationData | undefined>(undefined)

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const userDefaultCountry = countryList.find((country) => country.id === userDefaultCountryId);
        setUserDefaultValue(userDefaultCountry);
    }, []);

    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ android: insets.bottom + 24, default: insets.bottom }),
        left: 12,
        right: 12,
    };

    const filteredOptions = useMemo(() => {
        return countryList.filter((country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, countryList]);

    return (
        <Select
            onValueChange={(id) => {
                console.log(id?.value, "ONCHANGE");
                onValueChange(id?.value)
                setSelectedCountry({ id: id?.value, name: id?.label })
            }}
            defaultValue={{
                value: userDefaultValue?.id as string,
                label: userDefaultValue?.name as string
            }}
        >
            <SelectTrigger className=''>
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Select a country'
                />
            </SelectTrigger>
            <SelectContent
                side="top"
                insets={contentInsets}
                className='w-full bg-white'
            >
                <View>
                    <Input
                        placeholder='Search by Country'
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <ScrollView className='max-h-48'>
                    <SelectGroup>
                        <SelectLabel>Countries</SelectLabel>
                        <FlatList
                            scrollEnabled={false}
                            data={filteredOptions}
                            renderItem={({ item, index }) => (
                                <SelectItem label={item.name} value={item.id} key={index}>
                                    {item.name}
                                </SelectItem>
                            )}
                        />
                    </SelectGroup>
                </ScrollView>
            </SelectContent>
        </Select>
    )
}

export default CountryDropdown