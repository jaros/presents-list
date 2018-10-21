import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Colors from '../constants/Colors';

export default class SelectListsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 1,
      links: [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        },
    ]
    };
  }

  labelStyle = (link) => {
    return link.id == this.state.active ? [styles.optionText, styles.optionsActive] : styles.optionText;
  }

  render() {
    return (
      <View>
        <Text style={styles.optionsTitleText}>
          Lists
        </Text>

        {this.state.links.map(link =>
          <Touchable
            key={link.id}
            background={Touchable.Ripple('#ccc', false)}
            style={styles.option}
            onPress={this._handlePressListLink(link.id)}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="ios-list" size={22} color={link.id == this.state.active ? Colors.logoMainColor : "#ccc"} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={this.labelStyle(link)}>
                  List {link.id}
                </Text>
              </View>
            </View>
          </Touchable>
        )}
      </View>
    );
  }

  _handlePressListLink = (id) => () => {
    this.setState({
      active: id
    });
    this.props.navigation.navigate('ActiveListStack', { listId: id });
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
  optionsActive: {
    color: Colors.logoMainColor,
    fontWeight: '500',
    textDecorationLine: 'underline'
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
