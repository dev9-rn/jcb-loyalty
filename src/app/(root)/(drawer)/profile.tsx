import { View, Text } from 'react-native'
import React from 'react'

type Props = {}

const ProfileScreen = ({ }: Props) => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Profile Screen</Text>
            {/* <Button title="Logout" onPress={logout} /> */}
        </View>
    )
}

export default ProfileScreen