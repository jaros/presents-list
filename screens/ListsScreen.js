import React from 'react';
import { StyleSheet } from 'react-native';
import SelectListsView from '../components/SelectListsView';

export default class ListsScreen extends React.Component {
  static navigationOptions = {
    header: null,
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
