import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';

export default class SelectListsView extends React.Component {
  render() {
    return (
      <View>
        <Text style={styles.optionsTitleText}>
          Lists
        </Text>

        <Touchable
          style={styles.option}
          background={Touchable.Ripple('#ccc', false)}
          onPress={this._handlePressListLink(1)}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="ios-list" size={22} color="#ccc" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                My List
              </Text>
            </View>
          </View>
        </Touchable>

        <Touchable
          background={Touchable.Ripple('#ccc', false)}
          style={styles.option}
          onPress={this._handlePressListLink(2)}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="ios-list" size={22} color="#ccc" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                List 2
              </Text>
            </View>
          </View>
        </Touchable>

        <Touchable
          style={styles.option}
          background={Touchable.Ripple('#ccc', false)}
          onPress={this._handlePressListLink(3)}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="ios-list" size={22} color="#ccc" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                List 3
              </Text>
            </View>
          </View>
        </Touchable>
      </View>
    );
  }

  _handlePressListLink = (id) => () => {
    console.log('navigating to list id', id);
    this.props.navigation.navigate('NewListStack', { listId: id });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 9,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});
