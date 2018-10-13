import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import NewListScreen from '../screens/NewListScreen';
import ListsScreen from '../screens/ListsScreen';
import AboutScreen from '../screens/AboutScreen';

import Colors from '../constants/Colors';

const NewListStack = createStackNavigator({
  New: NewListScreen,
});

NewListStack.navigationOptions = {
  tabBarLabel: 'New',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-add-circle${focused ? '' : '-outline'}`
          : 'list-bullet'
      }
    />
  ),
};

const ListsStack = createStackNavigator({
  Lists: ListsScreen,
});

ListsStack.navigationOptions = {
  tabBarLabel: 'Lists',
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

export default createBottomTabNavigator({
  NewListStack,
  // ListsStack,
  AboutStack,
}, {
    tabBarOptions: {
        showLabel: true, // hide labels
        activeTintColor: Colors.logoMainColor, // active icon color
        inactiveTintColor: Colors.tabIconDefault,  // inactive icon color
        style: {
            backgroundColor: Colors.tabBar // TabBar background
        }
    }
});
