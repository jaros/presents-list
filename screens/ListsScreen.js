import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import SelectListsView from '../components/SelectListsView';

export default class ListsScreen extends React.Component {
  static navigationOptions = {
    // header: null,
    title: 'Lists',
    headerTitleStyle: {
      fontSize: 22,
      fontWeight: '500',
      color: Colors.tintColor
    },
  };

  render() {
    return <SelectListsView navigation={this.props.navigation}/>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
