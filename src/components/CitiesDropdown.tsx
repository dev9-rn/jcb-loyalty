import { FlatList, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
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
import { useRoute } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react-native';

type Props = {
    options: ILocationData[];
    selected: Option | null;
    onSelect: (...event: any[]) => void;
    placeholder?: string;
};

const CitiesDropdown = ({ options, selected, onSelect, placeholder }: Props) => {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!options) return [];
        if (!search) return options;

        return options.filter(opt =>
            opt?.name?.toLowerCase()?.includes(search.toLowerCase())
        );
    }, [search, options]);

    const selectedOption = useMemo(() => {
        if (!options) return undefined;
        return options.find(option => option?.id === selected?.value);
    }, [selected, options]);

    const handleSelect = (option: Option) => {
        onSelect({
            id: option?.value,
            name: option?.label
        });
        setSearch('');
        setVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.triggerText}>
                    {selectedOption ? selectedOption.name : placeholder || 'Select an option'}
                </Text>
                {visible ? <ChevronUpIcon size={20} color="#666" /> : <ChevronDownIcon size={20} color="#666" />}
            </TouchableOpacity>

            <Modal visible={visible} animationType='fade' transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            placeholder='Search...'
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            autoFocus
                        />
                        <FlatList
                            data={filtered}
                            keyExtractor={item => item.id}
                            keyboardShouldPersistTaps='handled'
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => handleSelect({
                                        label: item.name,
                                        value: item.id
                                    })}
                                >
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.noResult}>No results found</Text>
                            }
                        />
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    triggerText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        maxHeight: '80%',
    },
    searchInput: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        marginBottom: 12,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    cancel: {
        marginTop: 10,
        textAlign: 'center',
        color: 'red',
        fontSize: 16,
    },
    noResult: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
});

export default CitiesDropdown