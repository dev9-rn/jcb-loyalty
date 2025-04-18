import { View, Text } from 'react-native'
import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { storage, storageService } from '@/utils/storageService'
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
        name: "हिन्दी"
    },
    {
        langCode: "gu",
        name: "ગુજરાતી"
    },
    {
        langCode: "kn",
        name: "ಕನ್ನಡ"
    },
    {
        langCode: "mr",
        name: "मराठी"
    },
    {
        langCode: "pa",
        name: "ਪੰਜਾਬੀ"
    },
    {
        langCode: "ta",
        name: "தமிழ்"
    },
    {
        langCode: "bn",
        name: "বাংলা"
    },
    {
        langCode: "ur",
        name: "اردو"
    },
    {
        langCode: "or",
        name: "ଓଡିଆ"
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

    const getPreviousSelectedLanguage = () => {
        const savedLanguage = storage.getString(STORAGE_KEYS.LANGUAGE_KEYS);
        const previousSelectedLang = LANGUAGES.find((lang) => lang.langCode === savedLanguage)
        return previousSelectedLang
    };

    const handleLanguageChange = (langCode: string) => {
        storageService.setItem(STORAGE_KEYS.LANGUAGE_KEYS, langCode);
        i18n.changeLanguage(langCode);
    };

    const previousLanguage = getPreviousSelectedLanguage();

    return (
        <View className='flex-row items-center gap-8'>
            <Text className='text-lg font-medium'>Language:</Text>
            <Select
                defaultValue={{
                    label: previousLanguage?.name,
                    value: previousLanguage?.langCode
                }}
            >
                <SelectTrigger className='w-[200px]'>
                    <SelectValue
                        className='text-foreground text-sm native:text-lg'
                        placeholder='Select a language'
                    />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className='size-[200px]' side="top">
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
        </View>
    )
}

export default MultiLangualDropdown