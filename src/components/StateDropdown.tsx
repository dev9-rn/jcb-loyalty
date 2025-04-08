import { View, Text, Platform, FlatList } from 'react-native'
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
import { Option } from '@rn-primitives/select';
import { useRoute } from '@react-navigation/native';

type Props = {
    onValueChange: (...event: any[]) => void,
    setSelectedState?: Dispatch<SetStateAction<ILocationData | undefined>>;
    stateList: ILocationData[]
    defaultValue?: Option
}

const StateDropdown = ({ setSelectedState, stateList, onValueChange, defaultValue }: Props) => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const insets = useSafeAreaInsets();
    const route = useRoute();

    const contentInsets = {
        top: insets.top,
        bottom: Platform.select({ android: insets.bottom + 24, default: insets.bottom }),
        left: 12,
        right: 12,
    };

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return stateList;

        return stateList.filter((state) =>
            state.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, stateList]);

    const handleValueChange = useCallback((option: Option) => {
        const selectedCountry = stateList.find(state => state.id === option?.value);
        if (selectedCountry) {
            onValueChange({ id: option?.value, name: option?.label });
            if (setSelectedState) {
                setSelectedState(selectedCountry);
            }
        }
    }, [stateList, onValueChange, setSelectedState]);

    // Prevent unnecessary re-renders by memoizing input handler
    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const renderItem = useCallback(({ item }: { item: ILocationData, index: number }) => (
        <SelectItem key={item.id} value={item.id} label={item.name}>
            {item.name}
        </SelectItem>
    ), []);

    if (!defaultValue?.value && route.name !== "sign-up") return;

    return (
        <Select
            onValueChange={handleValueChange}
            defaultValue={defaultValue}
        >
            <SelectTrigger className=''>
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Select a state'
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
                        onChangeText={handleSearchChange}
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

export default StateDropdown