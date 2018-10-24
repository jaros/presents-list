import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Colors from '../constants/Colors';

export const todoItemsMetaList = {
  active: 1,
  links: [
    {
      id: 1,
      label: 'Primary list',
      showDone: true,
    },
    {
      id: 2,
      label: 'Kids list',
      showDone: true,
    },
    {
      id: 3,
      label: 'Food list',
      showDone: true,
    },
  ]
};

export default class SelectListsView extends React.Component {
  constructor(props) {
    super(props);
    let metaList = todoItemsMetaList;
    this.state = {
      active: metaList.active,
      links: metaList.links
    };
  }

  loadMetaList() {
    // 'TODO_ITEMS_META_LIST'
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.optionsTitleText}>
          Lists
        </Text>

        {this.state.links.map(link =>
          <Touchable
            key={link.id}
            background={Touchable.Ripple('#ccc', false)}
            style={link.id == this.state.active ? styles.activeOption : styles.option}
            onPress={this._handlePressListLink(link)}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="ios-list" size={22} color={link.id == this.state.active ? "#000" : "#ccc"} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>
                  {link.label}
                </Text>
              </View>
            </View>
          </Touchable>
        )}
        <Touchable
          background={Touchable.Ripple('#66ff40', false)}
          style={styles.option}
          onPress={() => {
            this.setState(previousState => {
              oldLinks = previousState.links;
              let newList = {
                id: oldLinks.length + 1,
                label: 'New list',
                showDone: true,
              }
              oldLinks.push(newList);
              return {
                  links: oldLinks,
                  active: newList.id,
              };
            }, () => {
              // TODO: save to metaList
              let links = this.state.links;
              this._handlePressListLink(links[links.length - 1])();
            });
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="ios-add-circle-outline" size={22} color={"#ccc"} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                Add new list
              </Text>
            </View>
          </View>
        </Touchable>
      </View>
    );
  }

  _handlePressListLink = (link) => () => {
    this.setState({
      active: link.id
    });
    this.props.navigation.navigate('ActiveListStack',
    {
      list: link,
      onUpdate: (name) => {
        console.log('new name', name);
        link.label = name;
        this.setState(previousState => {
          const objIndex = previousState.links.findIndex((obj => obj.id == link.id));
          previousState.links[objIndex].label = name;
          return {
            links: previousState.links
          }
        });
      }
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
  },
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionsActive: {
    backgroundColor: Colors.logoLightColor,
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
  activeOption: {
    backgroundColor: Colors.logoLightColor,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.logoMainColor,
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});
