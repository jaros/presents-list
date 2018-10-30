import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import SelectListsView from '../components/SelectListsView';

export default class ListsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <ScrollView
        style={styles.container} 
        keyboardShouldPersistTaps='always'>
        {/* Go ahead and delete ExpoLinksView and replace it with your
           * content, we just wanted to provide you with some helpful links */}
        <SelectListsView navigation={this.props.navigation}/>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
