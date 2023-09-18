import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import SideMenu from './SideMenu';
import LoginScreen from '../components/Login/LoginScreen';
import SignUpScreen from '../components/Login/SignUpScreen';
import OTPVerification from '../components/Login/OTPVerification';
import HomeScreen from '../components/Home/HomeScreen';
import NotificationScreen from '../components/Home/NotificationScreen';
import RemoveAccount from '../components/Profile/RemoveAccount';
import ScanScreen from '../components/Scan/ScanScreen';
import HistoryScreen from '../components/History/HistoryScreen';
import ProfileScreen from '../components/Profile/ProfileScreen';
import ReportScreen from '../components/Report/ReportScreen';
import  ReportHistory  from '../components/Report/ReportHistory';
import CouponSchemeDetails from '../components/History/CouponSchemeDetails';
import LanguageSelection from './LanguageSelection';
import CashBatchesScreen from '../components/CashBatchesScreen';
// import LandingScreen from '../components/Login/LandingScreen';


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
  OTPVerification: { screen: OTPVerification, navigationOptions: { header: null } },
  HomeScreen: { screen: HomeScreen, navigationOptions: { header: null } },
  NotificationScreen: { screen: NotificationScreen, navigationOptions: { header: null } },
  ScanScreen: { screen: ScanScreen, navigationOptions: { header: null } },
  HistoryScreen: { screen: HistoryScreen, navigationOptions: { header: null } },
  ReportScreen: { screen: ReportScreen, navigationOptions: { header: null } },
  ProfileScreen: { screen: ProfileScreen, navigationOptions: { header: null } },
  RemoveAccount: { screen: RemoveAccount, navigationOptions: { header: null } },
  ReportHistory: { screen: ReportHistory, navigationOptions: { header: null } },
  CouponSchemeDetails: { screen: CouponSchemeDetails, navigationOptions: { header: null } },
  LanguageSelection: { screen: LanguageSelection, navigationOptions: { header: null } },
  CashBatchesScreen: { screen: CashBatchesScreen, navigationOptions: { header: null } },
  // LandingScreen: { screen: LandingScreen, navigationOptions: { header: null } },
},
  {
    // initialRouteName: "LoginScreen",
    initialRouteName: "LoginScreen",
    headerMode: 'float',
  }
);
const Route = createAppContainer(MainNavigator);

export default Route;