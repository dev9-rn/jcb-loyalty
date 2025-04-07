import { Platform, View } from 'react-native'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
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
import { FlatList } from 'react-native-gesture-handler';
import { Input } from './ui/input';
import { Option } from '@rn-primitives/select';

type Props = {
    onValueChange: (...event: any[]) => void,
    setSelectedCountry?: Dispatch<SetStateAction<ILocationData | undefined>>
    countryList: ILocationData[]
    userDefaultCountryId?: string | undefined;
    defaultValue: Option
}

const CountryDropdown = ({ countryList, setSelectedCountry, onValueChange, userDefaultCountryId, defaultValue }: Props) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [userDefaultValue, setUserDefaultValue] = useState<ILocationData | undefined>(undefined)

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const userDefaultCountry = countryList.find((country) => country.id === userDefaultCountryId);
        setUserDefaultValue(userDefaultCountry);
    }, [userDefaultCountryId, countryList]);

    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ android: insets.bottom + 24, default: insets.bottom }),
        left: 12,
        right: 12,
    };

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return countryList;

        return countryList.filter((country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, countryList]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const handleValueChange = useCallback((option: Option) => {
        const selectedCountry = countryList.find(country => country.id === option?.value);
        if (selectedCountry) {
            onValueChange({ id: option?.value, name: option?.label });
            if (setSelectedCountry) {
                setSelectedCountry(selectedCountry);
            }
        }
    }, [countryList, onValueChange, setSelectedCountry]);

    const renderItem = useCallback(({ item }: { item: ILocationData, index: number }) => (
        <SelectItem key={item.id} value={item.id} label={item.name}>
            {item.name}
        </SelectItem>
    ), []);

    console.log(defaultValue, "DEF_VAL");

    return (
        <Select onValueChange={handleValueChange} defaultValue={defaultValue}>
            <SelectTrigger>
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
                <View style={{ paddingBottom: 8 }}>
                    <Input
                        placeholder='Search by Country'
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                    />
                </View>
                <View style={{ maxHeight: 300 }}>
                    <FlatList
                        data={filteredOptions}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                    />
                </View>
            </SelectContent>
        </Select>
    );
};

export default CountryDropdown;