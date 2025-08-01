package com.npl_seqrloyalty;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
// import com.hieuvp.fingerprint.ReactNativeFingerprintScannerPackage;
// import com.ashideas.rnrangeslider.RangeSliderPackage;
// import net.mikehardy.rnupdateapk.RNUpdateAPKPackage;
import com.RNFetchBlob.RNFetchBlobPackage; 
import com.cubicphuse.RCTTorch.RCTTorchPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
// import io.invertase.firebase.RNFirebasePackage;
// import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; 
// import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import org.reactnative.camera.RNCameraPackage;
import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
// import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import com.rnfs.RNFSPackage;
import com.emekalites.react.compress.image.ImageCompressPackage;
import cl.json.RNSharePackage; 
import cl.json.ShareApplication;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          // packages.add(new RNFirebaseMessagingPackage()); 
          // packages.add(new RNFirebaseNotificationsPackage());
          // packages.add(new RNFirebaseAuthPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  // private final ReactNativeHost mNewArchitectureNativeHost =
  //     new MainApplicationReactNativeHost(this);

  @Override
  public ReactNativeHost getReactNativeHost() {
    // if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
    //   return mNewArchitectureNativeHost;
    // } else {
      return mReactNativeHost;
    // }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // If you opted-in for the New Architecture, we enable the TurboModule system
    // ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    BackgroundTaskPackage.useContext(this);
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.npl_seqrloyalty.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
