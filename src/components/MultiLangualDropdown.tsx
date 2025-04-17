import { View, Text } from 'react-native'
import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { storageService } from '@/utils/storageService'
import { STORAGE_KEYS } from '@/libs/constants'
import i18n from '@/libs/i18n'

type Props = {}

const LANGUAGES = [
    {
        langCode: "en",
        name: "English"
    },
    {
        langCode: "hi",
        name: "Hindi"
    },
]

const MultiLangualDropdown = ({ }: Props) => {

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const handleLanguageChange = (langCode: string) => {
        storageService.setItem(STORAGE_KEYS.LANGUAGE_KEYS, langCode);
        i18n.changeLanguage(langCode);
    }

    return (
        <Select defaultValue={{ value: 'en', label: 'English' }}>
            <SelectTrigger className='w-[250px]'>
                <SelectValue
                    className='text-foreground text-sm native:text-lg'
                    placeholder='Select a language'
                />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className='size-[250px]' side="top">
                <ScrollView>
                    <SelectGroup>
                        <SelectLabel>Languages</SelectLabel>
                        <FlatList
                            scrollEnabled={false}
                            className=''
                            data={LANGUAGES}
                            renderItem={({ item, index }) => (
                                <SelectItem
                                    label={item.name}
                                    value={item.langCode}
                                    key={index}
                                    onPress={() => handleLanguageChange(item.langCode)}
                                >
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

export default MultiLangualDropdown