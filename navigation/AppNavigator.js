import React from 'react';
import { createStackNavigator } from 'react-navigation';
import ListsScreen from '../screens/ListsScreen';
import ActiveListScreen from '../screens/ActiveListScreen';

export default createStackNavigator(
  {
    Lists: ListsScreen,
    ActiveList: ActiveListScreen,
  },
  {
    initialRouteName: 'Lists',
  }
);