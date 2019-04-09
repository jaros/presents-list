import React from 'react';
import { Keyboard, Platform } from 'react-native';
import { createStackNavigator, createMaterialTopTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ActiveListScreen from '../screens/ActiveListScreen';
import ListsScreen from '../screens/ListsScreen';
import AboutScreen from '../screens/AboutScreen';

import Colors from '../constants/Colors';

const ActiveListStack = createStackNavigator({
  Active: ActiveListScreen,
});

const hideKeyboard = routeName => ({navigation}) => {
  Keyboard.dismiss();
  navigation.navigate(routeName);
};

ActiveListStack.navigationOptions = {
  tabBarLabel: 'Active',
  tabBarOnPress: hideKeyboard('ActiveListStack'),
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? 'ios-list'
          : 'list-bullet'
      }
    />
  ),
};

const ListsStack = createStackNavigator({
  Lists: ListsScreen,
});

ListsStack.navigationOptions = {
  tabBarLabel: 'My Lists',
  tabBarOnPress: hideKeyboard('ListsStack'),
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-list${focused ? '-box' : ''}` : 'md-list'}
    />
  ),
};

const AboutStack = createStackNavigator({
  About: AboutScreen,
});

AboutStack.navigationOptions = {
  tabBarLabel: 'About',
  tabBarOnPress: hideKeyboard('AboutStack'),
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  ),
};

export default createMaterialTopTabNavigator({
  ActiveListStack,
  ListsStack,
  AboutStack,
}, {
    // initialRouteName: 'ActiveListStack',
    // tabBarPosition: 'bottom',
    swipeEnabled: true,
    animationEnabled: true,
    lazy: false,
    tabBarOptions: {
        showLabel: true,
        showIcon: false,
        activeTintColor: Colors.logoMainColor, // active icon color
        inactiveTintColor: Colors.tabIconDefault,  // inactive icon color
        indicatorStyle: {
          backgroundColor: Colors.logoMainColor,
        },
        style: {
            paddingTop: 60,
            backgroundColor: Colors.tabBar // TabBar background
        }
    }
});
