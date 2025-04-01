import { FlatList, Platform, TextInput, View } from 'react-native'
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'
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

type Props = {
    onValueChange: (...event: any[]) => void,
    setSelectedCity: Dispatch<SetStateAction<ILocationData | undefined>>;
    citiesList: ILocationData[]
}

const CitiesDropdown = ({ citiesList, setSelectedCity, onValueChange }: Props) => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const insets = useSafeAreaInsets();

    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ android: insets.bottom + 24, default: insets.bottom }),
        left: 12,
        right: 12,
    };

    const filteredOptions = useMemo(() => {
        return citiesList.filter((city) =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, citiesList]);

    return (
        <Select
            onValueChange={(id) => {
                onValueChange(id?.value)
                setSelectedCity(id)
            }}
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
                            renderItem={({ item, index }) => (
                                <SelectItem label={item.name} value={item.id} key={index}>
                                    {item.name}
                                </SelectItem>
                            )}
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