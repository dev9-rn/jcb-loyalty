import { View, Text, FlatList } from 'react-native'
import React from 'react'
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
import { Option } from '@rn-primitives/select';

type Props = {
    onValueChange: (...event: any[]) => void;
    brands: IBrandsDetails[] | undefined;
    defaultValue?: Option
}

const SelectBrandDropdown = ({ onValueChange, brands }: Props) => {

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    return (
        <Select onValueChange={(value) => onValueChange({ id: value?.value, name: value?.label })}>
            <SelectTrigger className=''>
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Select a brand'
                />
            </SelectTrigger>
            <SelectContent side='top' insets={contentInsets} className='w-full'>
                <ScrollView className='max-h-48'>
                    <SelectGroup>
                        <SelectLabel>Brands</SelectLabel>
                        <FlatList
                            scrollEnabled={false}
                            data={brands}
                            renderItem={({ item, index }) => (
                                <SelectItem label={item.name} value={item.id} key={index}>
                                    {item.name}
                                </SelectItem>
                            )}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </SelectGroup>
                </ScrollView>
            </SelectContent>
        </Select>
    )
}

export default SelectBrandDropdown