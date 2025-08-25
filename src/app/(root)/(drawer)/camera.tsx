import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import CameraScreen from '../(stack)/camera';

const DrawerCameraScreen = () => {
    const [instanceKey, setInstanceKey] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            setInstanceKey(prev => prev + 1);
            return () => {
                // Cleanup if necessary
                setInstanceKey(0)
            }
        }, [])

    );


    return <CameraScreen key={instanceKey} />;
};

export default DrawerCameraScreen;