import React from 'react';
import { Alert, AsyncStorage, Button, StyleSheet, Image, Text, View, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Colors from '../constants/Colors';
import { ActionIcon } from './TodoItem';
import RenameList from '../components/RenameList';

export const todoItemsMetaList = {
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
    this.state = {
      metaList: todoItemsMetaList,
      edit: false,
      editableList: 0,
      showRenameList: false,
    };

    const willFocusSubscription = this.props.navigation.addListener('willFocus', this.loadMetaList);
  }

  activeList = () => {
    return this.state.metaList.links.find(it => it.id === this.state.metaList.active);
  };

  editableListName = () => {
    const list = this.state.metaList.links.find(it => it.id === this.state.editableList);
    return list ? list.label : 'no list selected';
  };

  toggleShowRenameList = (listId) => {

    this.setState(previousState => {
      return {
        showRenameList: !previousState.showRenameList,
        editableList: listId
      }
    });
  };

  onListNameUpdate = (value) => {
    this.setState(previousState => {
      const objIndex = previousState.metaList.links.findIndex((obj => obj.id == previousState.editableList));
      previousState.metaList.links[objIndex].label = value;
      return {
        metaList: {
          ...previousState.metaList,
          links: previousState.metaList.links
        }
      }
    }, this.saveMetaList);
  };

  loadMetaList = async () => {
    try {
      const value = await AsyncStorage.getItem('TODO_ITEMS_META_LIST');
      if (value) {
        this.setState({
          metaList: JSON.parse(value)
        });
      }
      else { // init first time
        this.setState({
          metaList: todoItemsMetaList
        }, this.saveMetaList);
      }
    }
    catch (err) {
      return console.log(err);
    }
  };

  itemsToList = (items) => {
    const labels = JSON.parse(items).map(item => item.text);
    let result = '';
    labels.forEach(label => result += (`- ${label}\n`));
    return result;
  };

  getListContent = async (listId) => {
    try {
      return this.itemsToList(await AsyncStorage.getItem('TODO_ITEMS_' + listId));
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  saveMetaList = () => {
    AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(this.state.metaList));
  };

  deleteList = (id) => {

    const doDelete = () => this.setState(previousState => {
      const links = previousState.metaList.links.filter(obj => obj.id !== id);

      const active = id !== previousState.metaList.active
        ? previousState.metaList.active // remain current active
        : links.length !== 0 ? links[0].id : -1; // take  first from the rest
      return {
        metaList: {
          active: active,
          links: links
        }
      }
    }, () => {
      this.saveMetaList();
      AsyncStorage.removeItem('TODO_ITEMS_' + id);
      if (id == 1) { // backward compatibility, TODO remove on release
        AsyncStorage.removeItem('TODO_ITEMS');
      }
    });

    Alert.alert('Confirm list delete', 'Remove the list?', [
      {
        text: 'Yes',
        onPress: doDelete,
      }, {
        text: 'Cancel',
        onPress: () => console.log('cancelled'),
        type: 'cancel'
      }]
    );

  }

  addNewList = () => {
    this.setState(previousState => {
      oldLinks = previousState.metaList.links;
      let newList = {
        id: new Date().getTime(),
        label: 'New list',
        showDone: true,
      }
      oldLinks.unshift(newList);
      return {
        metaList: {
          links: oldLinks,
          active: newList.id
        }
      };
    }, () => {
      this.saveMetaList();
      let links = this.state.metaList.links;
      this._handlePressListLink(links[0])();
    });
  };

  render() {
    return (
      <View style={styles.container}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Touchable
            background={Touchable.Ripple('#66ff40', false)}
            onPress={this.addNewList}>
            <View style={[styles.optionIconContainer, {paddingLeft: 15}]}>
                <Ionicons name="ios-add" size={35} color={Colors.iosDefault}/>
            </View>
          </Touchable>  
          
          <View style={{ paddingHorizontal: 10 }}>
            {!this.state.edit &&
              <Button
                onPress={() => {
                  this.setState({
                    edit: true,
                  })
                }}
                title='Edit' />
            }
            {this.state.edit &&
              <Button
                onPress={() => {
                  this.setState({
                    edit: false,
                  })
                }}
                title='Done' />
            }
          </View>
        </View>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps='always'>
          {this.state.metaList.links.map(link =>
            <View
              key={link.id}
              style={link.id == this.state.metaList.active ? styles.activeOption : styles.option}>
              <Touchable
                background={Touchable.Ripple('#ccc', false)}
                style={{ flex: 1, overflow: 'hidden', }}
                onPress={this._handlePressListLink(link)}>

                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15 }}>
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
              {this.state.edit &&
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <View style={styles.optionIconContainer}>
                    <ActionIcon
                      icon='ios-paper-plane'
                      color='#1284f7'
                      click={async () => {
                        const listContent = await this.getListContent(link.id);
                        Share.share(
                          {
                            title: `Share a list ${link.label} with friend`,
                            message: await this.getListContent(link.id),
                            url: 'https://github.com/jaros/check-list',
                          }
                        );
                      }}
                    />
                  </View>
                  <View style={styles.optionIconContainer}>
                    <ActionIcon
                      icon='ios-create'
                      click={() => this.toggleShowRenameList(link.id)}
                      color='#1284f7'
                    />
                  </View>
                  <View style={styles.optionIconContainer}>
                    <ActionIcon
                      icon='ios-remove-circle'
                      click={() => {
                        console.log('delete a list', link.id);
                        this.deleteList(link.id);
                      }}
                      color='#ff3b30' />
                  </View>
                </View>
              }
            </View>
          )}
          
          {this.state.editableList &&
            <RenameList
              onUpdate={this.onListNameUpdate}
              initValue={this.editableListName}
              show={this.state.showRenameList}
              toggleShow={this.toggleShowRenameList}
            />
          }
        </ScrollView>
      </View>
    );
  }

  _handlePressListLink = (link) => () => {
    this.setState({
      edit: false,
      metaList: {
        ...this.state.metaList,
        active: link.id
      }
    }, this.saveMetaList);
    this.navigateToActive(link);
  };

  navigateToActive = (link) => {
    this.props.navigation.navigate('ActiveListStack', {});
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 60,
    backgroundColor: '#fff',
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
    height: 44,
    paddingLeft: 15,
    //paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  activeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.logoLightColor,
    height: 44,
    paddingLeft: 15,
    //paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.logoMainColor,
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});
