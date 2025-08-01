
// import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
// import {createStackNavigator} from "react-navigation-stack"
import SideMenu from './SideMenu';
import LoginScreen from '../components/Login/LoginScreen';
import SignUpScreen from '../components/Login/SignUpScreen';
import OTPVerification from '../components/Login/OTPVerification';
import HomeScreen from '../components/Home/HomeScreen';
import NotificationScreen from '../components/Home/NotificationScreen';
import ScanScreen from '../components/Scan/ScanScreen';
import HistoryScreen from '../components/History/HistoryScreen';
import ProfileScreen from '../components/Profile/ProfileScreen';
import ReportScreen from '../components/Report/ReportScreen';
import MechanicSignupForm from '../components/Forms/MechanicSignupForm';
import MechanicLoginScreen from '../components/Login/MechanicLoginScreen';
import MechanicOtpVerification from '../components/Login/MechanicOtpVerification';
import MechanicProfileScreen from '../components/Profile/MechanicProfileScreen';
import PaymentDetailsScreen from '../components/Scan/PaymentDetailsScreen';
import ReportHistory from '../components/Report/ReportHistory';
// import PassbookScreen from '../components/Verifier/PassbookScreen';
// import GiftProductsScreen from '../components/Verifier/GiftProductsScreen';
// import ProductsHistoryScreen from '../components/Verifier/ProductsHistoryScreen';
// import AllScreen from '../components/Verifier/AllScreen';
// import InScreen from '../components/Verifier/InScreen';
// import OutScreen from '../components/Verifier/OutScreen';
import Colors from '../components/Utility/Colors';
// import GiftProductsDetailsScreen from '../components/Verifier/GiftProductsDetailsScreen';
// import ImageSlideScreen from '../components/Verifier/ImageSlideScreen';
import LanguageSelection from './LanguageSelection';
// import FingerPrintScannerDemo from '../components/FingerPrintScanner/FingerPrintScannerDemo';
import RemoveAccount from '../components/Profile/RemoveAccount';
import CashBatchesScreen from '../components/CashBatchesScreen';
import MaintenancePage from '../components/MaintenancePage';

export const Drawer = createDrawerNavigator({
  HomeScreen: { screen: HomeScreen },
  ScanScreen: { screen: ScanScreen },
  HistoryScreen: { screen: HistoryScreen },
  ProfileScreen: { screen: ProfileScreen },
}, {
    ContentComponent: SideMenu,
    drawerWidth: 100,
    drawerPosition: 'right',
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
  });
const MainNavigator = createStackNavigator({
  LoginScreen: { screen: LoginScreen, navigationOptions: { header: null } },
  SignUpScreen: { screen: SignUpScreen, navigationOptions: { header: null } },
  // Colors: { screen: Colors, navigationOptions: { header: null } },
  OTPVerification: { screen: OTPVerification, navigationOptions: { header: null } },
  HomeScreen: { screen: HomeScreen, navigationOptions: { header: null } },
  NotificationScreen: { screen: NotificationScreen, navigationOptions: { header: null } },
  ScanScreen: { screen: ScanScreen, navigationOptions: { header: null } },
  HistoryScreen: { screen: HistoryScreen, navigationOptions: { header: null } },
  ReportScreen: { screen: ReportScreen, navigationOptions: { header: null } },
  ProfileScreen: { screen: ProfileScreen, navigationOptions: { header: null } },
  ReportHistory: { screen: ReportHistory, navigationOptions: { header: null } },
  MechanicSignupForm: { screen: MechanicSignupForm, navigationOptions: { header: null } },
  MechanicLoginScreen: { screen: MechanicLoginScreen, navigationOptions: { header: null } },
  MechanicOtpVerification: { screen: MechanicOtpVerification, navigationOptions: { header: null } },
  MechanicProfileScreen: { screen: MechanicProfileScreen, navigationOptions: { header: null } },
  PaymentDetailsScreen: { screen: PaymentDetailsScreen, navigationOptions: { header: null } },
  // PassbookScreen: { screen: PassbookScreen, navigationOptions: { header: null } },
  // GiftProductsScreen: { screen: GiftProductsScreen, navigationOptions: { header: null } },
  // ProductsHistoryScreen: { screen: ProductsHistoryScreen, navigationOptions: { header: null } },
  // AllScreen: { screen: AllScreen, navigationOptions: { header: null } },
  // InScreen: { screen: InScreen, navigationOptions: { header: null } },
  // OutScreen: { screen: OutScreen, navigationOptions: { header: null } },
  // GiftProductsDetailsScreen: { screen: GiftProductsDetailsScreen, navigationOptions: { header: null } },
  // ImageSlideScreen: { screen: ImageSlideScreen, navigationOptions: { header: null } },
  LanguageSelection: { screen: LanguageSelection, navigationOptions: { header: null } },
  CashBatchesScreen: { screen: CashBatchesScreen, navigationOptions: { header: null } },
  // FingerPrintScannerDemo: { screen: FingerPrintScannerDemo, navigationOptions: { header: null } },
  RemoveAccount: { screen: RemoveAccount, navigationOptions: { header: null } },
  MaintenancePage: { screen: MaintenancePage, navigationOptions: { header: null } },
},
  {
    initialRouteName: "LoginScreen",
    // initialRouteName: "LanguageSelection",
  }
);
const Route = createAppContainer(MainNavigator);

export default Route;