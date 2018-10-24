import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createMaterialTopTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import NewListScreen from '../screens/NewListScreen';
import ListsScreen from '../screens/ListsScreen';
import AboutScreen from '../screens/AboutScreen';

import Colors from '../constants/Colors';

const ActiveListStack = createStackNavigator({
  New: NewListScreen,
});

ActiveListStack.navigationOptions = {
  tabBarLabel: 'Active',
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
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  ),
};

export default createMaterialTopTabNavigator({
  ListsStack,
  ActiveListStack,
  AboutStack,
}, {
    // initialRouteName: 'ActiveListStack',
    // tabBarPosition: 'bottom',
    swipeEnabled: true,
    animationEnabled: true,
    lazy: true,
    tabBarOptions: {
        showLabel: true,
        showIcon: false,
        activeTintColor: Colors.logoMainColor, // active icon color
        inactiveTintColor: Colors.tabIconDefault,  // inactive icon color
        indicatorStyle: {
          backgroundColor: Colors.logoMainColor,
        },
        style: {
            paddingTop: 30,
            backgroundColor: Colors.tabBar // TabBar background
        }
    }
});
