import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import CameraScreen from '../(stack)/camera';

const DrawerCameraScreen = () => {
  // ✅ instanceKey still kept as a safety net to force full remount
  // if coming back from a deeply nested navigation stack
  const [instanceKey, setInstanceKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setInstanceKey(prev => prev + 1);
      return () => {
        // No need to reset to 0 — that caused the camera to
        // remount with key=0 on every blur, briefly re-activating it
        // ✅ Just leave the key as-is; CameraScreen's own useFocusEffect
        //    handles deactivation cleanly
      };
    }, [])
  );

  return <CameraScreen key={instanceKey} />;
};

export default DrawerCameraScreen;