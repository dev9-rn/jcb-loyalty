import { FlatList, Platform, TextInput, View } from 'react-native'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
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
import { Text } from './ui/text';
import { Option } from '@rn-primitives/select';

type Props = {
    onValueChange: (...event: any[]) => void,
    setSelectedCity?: Dispatch<SetStateAction<ILocationData | undefined>>;
    citiesList: ILocationData[];
    defaultValue: Option
}

const CitiesDropdown = ({ citiesList, setSelectedCity, onValueChange, defaultValue }: Props) => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const insets = useSafeAreaInsets();

    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ android: insets.bottom + 24, default: insets.bottom }),
        left: 12,
        right: 12,
    };

    const handleValueChange = useCallback((option: Option) => {
        const selectedCountry = citiesList.find(city => city.id === option?.value);
        if (selectedCountry) {
            onValueChange({ id: option?.value, name: option?.label });
            if (setSelectedCity) {
                setSelectedCity(selectedCountry);
            }
        }
    }, [citiesList, onValueChange, setSelectedCity]);

    const renderItem = useCallback(({ item }: { item: ILocationData, index: number }) => (
        <SelectItem key={item.id} value={item.id} label={item.name}>
            {item.name}
        </SelectItem>
    ), []);

    const filteredOptions = useMemo(() => {
        return citiesList.filter((city) =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, citiesList]);

    if (!defaultValue?.value) return;

    return (
        <Select
            onValueChange={handleValueChange}
            defaultValue={defaultValue}
        >
            <SelectTrigger className=''>
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Select a city'
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
                            renderItem={renderItem}
                            ListEmptyComponent={() => (
                                <View>
                                    <Text>Please select a country first</Text>
                                </View>
                            )}
                        />
                    </SelectGroup>
                </ScrollView>
            </SelectContent>
        </Select>
    )
}

export default CitiesDropdown