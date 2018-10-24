import React from 'react';
import { AsyncStorage, Button, StyleSheet, Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Colors from '../constants/Colors';
import { ActionIcon } from './TodoItem';

const todoItemsMetaList = {
  active: 1,
  links: [
    {
      id: 1,
      label: 'My list',
      showDone: true,
    }
  ]
};

export default class SelectListsView extends React.Component {
  constructor(props) {
    super(props);
    let metaList = todoItemsMetaList;
    this.state = {
      metaList: {
        active: metaList.active,
        links: metaList.links,
      },
      edit: false,
    };

    // const willFocusSubscription = this.props.navigation.addListener(
    //   'willFocus',
    //   () => this.loadMetaList()
    // );
    this.loadMetaList().then(() =>
      this.navigateToActive(this.state.metaList.links.find(it => it.id == this.state.metaList.active))
    );
  }

  loadMetaList = () => {
    return AsyncStorage.getItem('TODO_ITEMS_META_LIST').then(value => {
      if (value) {
        this.setState({
          metaList: JSON.parse(value)
        });
      } else { // init first time
        this.setState({
          metaList: todoItemsMetaList
        }, this.saveMetaList);
      }
    })
    .catch(err => console.log(err));
  };

  saveMetaList = () => {
    AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(this.state.metaList));
  };

  deleteList = (id) => {
    this.setState(previousState => {
      return {
        metaList: {
          ...previousState.metaList,
          links: previousState.metaList.links.filter(obj => obj.id !== id)
        }
      }
    }, () => {
      this.saveMetaList();
      AsyncStorage.removeItem('TODO_ITEMS_' + id);
      if (id == 1) {
        AsyncStorage.removeItem('TODO_ITEMS');
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.optionsTitleText}>
            Lists
          </Text>
          <View style={{paddingRight: 10}}>
            {!this.state.edit &&
              <Button
                onPress={() => {
                  this.setState({
                    edit: true,
                  })
                }}
                title='Edit'/>
            }
            {this.state.edit &&
              <Button
                onPress={() => {
                  this.setState({
                    edit: false,
                  })
                }}
                title='Done'/>
            }
          </View>
        </View>

        {this.state.metaList.links.map(link =>
          <View
            key={link.id}
            style={link.id == this.state.metaList.active ? styles.activeOption : styles.option}>
          <Touchable
            background={Touchable.Ripple('#ccc', false)}
            style={{flex: 1}}
            onPress={this._handlePressListLink(link)}>

              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="ios-list" size={22} color={link.id == this.state.metaList.active ? "#000" : "#ccc"} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>
                    {link.label}
                  </Text>
                </View>
              </View>
            </Touchable>
              {this.state.edit && link.id !== this.state.metaList.active &&
                <View style={styles.optionIconContainer}>
                <ActionIcon icon='ios-close-circle-outline' click={() => {
                  console.log('delete a list', link.id);
                  this.deleteList(link.id);
                }}
                color='red'/>
              </View>
              }
          </View>
        )}
        <Touchable
          background={Touchable.Ripple('#66ff40', false)}
          style={styles.option}
          onPress={() => {
            this.setState(previousState => {
              oldLinks = previousState.metaList.links;
              let newList = {
                id: oldLinks.length + 1,
                label: 'New list',
                showDone: true,
              }
              oldLinks.push(newList);
              return {
                metaList: {
                  links: oldLinks,
                  active: newList.id
                }
              };
            }, () => {
              this.saveMetaList();
              let links = this.state.metaList.links;
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
    if (this.state.edit) {
      return;
    }
    this.setState({
      metaList: {
        ...this.state.metaList,
        active: link.id
      }
    }, this.saveMetaList);
    this.navigateToActive(link);
  };

  navigateToActive = (link) => {
    this.props.navigation.navigate('ActiveListStack',
    {
      list: link,
      // onUpdate: (meta) => {
      //   console.log('new metaList', meta);
      //   this.setState(previousState => {
      //     return {
      //       metaList: meta
      //     }
      //   });
      // }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 15,
    //paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  activeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.logoLightColor,
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 15,
    //paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.logoMainColor,
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});
