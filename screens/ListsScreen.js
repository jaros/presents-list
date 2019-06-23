import React from 'react';
import { ActivityIndicator, Animated, Alert, AsyncStorage, Button, StyleSheet, Text, View, Platform, TouchableOpacity, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { ANIMATION_DURATION } from '../constants/Layout';
import { ActionIcon } from '../components/TodoItem';
import RenameList from '../components/RenameList';
import * as firebase from 'firebase';
import { firebaseConfig } from '../constants/config';

firebase.initializeApp(firebaseConfig);

export default class ListsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      // header: null,
      title: 'Lists',
      headerTitleStyle: {
        fontSize: 22,
        fontWeight: '500',
        color: Colors.tintColor
      },
      headerLeft: (
        <TouchableOpacity
          background={'#66ff40'}
          onPress={() => navigation.getParam('optionalAddNewlist')()}>
          <View style={[styles.optionIconContainer, { paddingLeft: 15 }]}>
            <Ionicons name="ios-add" size={35} color={Colors.iosDefault} />
          </View>
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{ paddingRight: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Button
            onPress={() => navigation.getParam('toggleEditAction')()}
            title={"" + navigation.getParam('headerRightBtnLabel', '')}
          />
          <TouchableOpacity
            background={'#66ff40'}
            onPress={() =>
              firebase.auth().signOut().then(() => console.log('signed out')).catch(error => console.log(error))
            }>
            <View style={[styles.optionIconContainer, { paddingLeft: 15 }]}>
              <Ionicons name="ios-log-out" size={28} color={Colors.iosDefault} />
            </View>
          </TouchableOpacity>
        </View>
      ),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      metaList: this.todoItemsMetaList(),
      edit: false,
      editableList: 0,
      showRenameList: false,
      userid: firebase.auth().currentUser.uid,
      loading: true
    };

    this.loadAndSyncronizeMetaList();
  }

  loadAndSyncronizeMetaList = async () => {

    const metaList = await this.loadRemoteMetaList();
    if (metaList) {
      this.setState({ metaList, loading: false });
    } else {
      const localData = await this.loadLocalMetaList();
      if (localData) {
        let mappedLocal = {
          ...localData,
          links: localData.links.reduce((acc, cur) => {
            cur.owner = this.state.userid;
            acc[cur.id] = cur;
            return acc;
          }, {})
        };
        this.setState({ metaList: mappedLocal, loading: false });
        firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid).set(mappedLocal);
        // store all local lists to remote db - backward compatibility
        return await firebase.database().ref().update(await this.firebaseUpdates(localData));
      } else {
        return initFirstTime();
      }
    }
  }

  firebaseUpdates = async (localData) => {
    const linkToUpdate = async (previousUpdates, link) => {
      const list = await AsyncStorage.getItem('TODO_ITEMS_' + link.id);
      const updates = await previousUpdates;

      if (!list) {
        // skip empty content lists
        return updates;
      }
      const listContentParsed = JSON.parse(list).reduce((acc, cur) => {
        acc[cur.key] = {
          ...cur,
          owner: this.state.userid
        };
        return acc;
      }, {})
      updates[`/TODO_ITEMS/${this.state.userid}/${link.id}`] = listContentParsed;
      return updates;
    };

    return await localData.links.reduce(linkToUpdate, {});
  }

  loadLocalMetaList = async () => {
    const value = await AsyncStorage.getItem('TODO_ITEMS_META_LIST');
    if (value) {
      const metaList = JSON.parse(value);
      if (metaList.links.length !== 0) {
        return metaList;
      }
    }
    return null;
  }

  loadRemoteMetaList = async () => {
    let snapshot = await firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid).once('value');
    return snapshot.val();
  }

  // it's not needed until more advance list sharing between users
  monitorRemoteMetaListChanges = async () => {
    try {
      this.metaListRef = firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid).on('value', async (snapshot) => {
        let metaList = snapshot.val();
        if (!metaList) {
          this.initFirstTime();
        } else {
          console.log("meta list data: " + metaList);
          this.setState({ metaList });
        }
      });
    }
    catch (err) {
      return console.log(err);
    }
  };

  initFirstTime = () => {
    const metaList = this.todoItemsMetaList();
    this.setState({ metaList, loading: false });
    return this.saveMetaList(metaList);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      toggleEditAction: this.toggleEditButton,
      optionalAddNewlist: this.optionalAddNewlist,
      headerRightBtnLabel: "Edit",
    });
  }

  componentWillUnmount() {
    if (this.metaListRef) {
      this.metaListRef.off();
    }
  }

  activeList = () => {
    return this.state.metaList.links[this.state.metaList.active];
  };

  editableListName = () => {
    if (this.state.editableList) {
      const list = this.state.metaList.links[this.state.editableList];
      return list ? list.label : 'no list selected';
    } else {
      return 'List ' + (Object.keys(this.state.metaList.links).length + 1);
    }
  };

  todoItemsMetaList = () => {
    const newId = this.generateId()
    let links = {
      [newId]: {
        id: newId,
        label: 'My list ONE',
        showDone: true,
      }
    };
    return {
      active: newId,
      links
    }
  };

  generateId = () => new Date().getTime()

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
      let { metaList, editableList } = previousState;
      //const objIndex = previousState.metaList.links.findIndex((obj => obj.id == previousState.editableList));
      metaList.links[editableList].label = value;
      return {
        metaList: {
          ...metaList,
          links: metaList.links
        }
      }
    }, this.saveMetaList);
  };

  saveMetaList = (metaList) => {
    if (!metaList) {
      metaList = this.state.metaList
    }
    return firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid).set(metaList);
  };

  updateShared = (listId, email) => {
    const metaList = this.state.metaList;
    metaList.links[listId].sharing = email;
    this.setState({ metaList });
    return firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid + '/links/' + listId + '/sharing').set(email);
  }

  doListDelete = id => this.setState(previousState => {
    console.log('deleting', id);
    let links = previousState.metaList.links;
    delete links[id];// previousState.metaList.links.filter(obj => obj.id !== id);

    console.log('after deleting', links);

    const active = id !== previousState.metaList.active
      ? previousState.metaList.active // remain current active
      : Object.keys(links).length !== 0 ? Object.values(links)[0].id : -1; // take  first from the rest
    return {
      metaList: {
        active: active,
        links: links
      }
    }
  }, () => {
    if (Object.keys(this.state.metaList.links).length === 0) {
      this.initFirstTime()
    } else {
      firebase.database().ref('TODO_ITEMS_META_LIST/' + this.state.userid + '/links/' + id).set(null);
      firebase.database().ref('TODO_ITEMS/' + this.state.userid + '/' + id).set(null);
    }
  });

  addNewList = (listName) => {
    const id = this.generateId();
    this.setState(previousState => {
      let oldLinks = previousState.metaList.links;
      // TODO: store userId in list details => requires registration
      let newList = {
        id,
        label: listName,
        showDone: true,
        owner: this.state.userid,
      }
      return {
        metaList: {
          links: {
            ...oldLinks,
            [id]: newList
          },
          active: newList.id
        }
      };
    }, () => {
      this.saveMetaList();
    });
  };

  optionalAddNewlist = this.toggleShowRenameList;

  toggleEditButton = () => {
    const isEdit = !this.state.edit
    this.setState({ edit: isEdit });
    this.props.navigation.setParams({ headerRightBtnLabel: isEdit ? "Done" : "Edit" });
  }

  renderLists = () => (
    <View style={styles.container}>
      {this.renderUserName()}
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps='always'>
        {Object.values(this.state.metaList.links).sort((a, b) => a.id - b.id).map(link =>
          <ListItem
            key={link.id}
            link={link}
            isActive={link.id === this.state.metaList.active}
            isEdit={this.state.edit}
            onPressLink={this._handlePressListLink}
            toggleShowRenameList={this.toggleShowRenameList}
            updateShared={this.updateShared}
            doListDelete={this.doListDelete} />
        )}
      </ScrollView>
      <RenameList
        autoFocus={true}
        onUpdate={this.state.editableList ? this.onListNameUpdate : this.addNewList}
        initValue={this.editableListName}
        show={this.state.showRenameList}
        toggleShow={this.toggleShowRenameList}
      />
    </View>
  );

  renderUserName = () => {
    const name = firebase.auth().currentUser.email;
    return (<View style={{padding:10, display: 'flex', alignSelf: 'flex-end'}}><Text>{name}</Text></View>)
  }

  render() {
    if (this.state.loading) {
      return (<View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" hidesWhenStopped={true} animating={true} />
      </View>)
    } else return this.renderLists();
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
    this.props.navigation.navigate('ActiveList', { name: link.label, id: link.id, listOwner: link.owner || this.state.userid });
  };
}

class ListItem extends React.Component {


  constructor(props) {
    super(props);
    this._animated = new Animated.Value(0);
    this.state = {
      shareViewVisible: false
    };
  }

  componentDidMount() {
    Animated.timing(this._animated, {
      toValue: 1,
      duration: ANIMATION_DURATION,
    }).start();
  }

  askDelete = (id) => {
    const runAnimation = () => {
      console.log('run animation')
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => this.props.doListDelete(id));
    }

    Alert.alert('Confirm list delete', 'Remove the list?', [
      {
        text: 'Yes',
        onPress: runAnimation,
      }, {
        text: 'Cancel',
        onPress: () => console.log('cancelled'),
        type: 'cancel'
      }]
    );
  }

  loadListDetails = async () =>
    (await firebase.database().ref('TODO_ITEMS/' + firebase.auth().currentUser.uid + '/' + listId).once('value')).val();

  getListContent = async (listId) => {
    const itemsToList = items => {
      if (items) {
        return "- " + JSON.parse(items).map(item => item.text).join("\n- ");
      }
      return 'empty list';
    };

    try {
      return itemsToList(await this.loadListDetails());
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  toggleShareView = () => this.setState({ shareViewVisible: !this.state.shareViewVisible });

  showShareView = () => this.setState({ shareViewVisible: true });

  renderShare = () => (<View style={{ marginTop: 22 }}>
    <RenameList
      autoFocus={true}
      onUpdate={(email) => {
        console.log('modal closed', this.props.link.id);
        this.props.updateShared(this.props.link.id, email);
      }}
      initValue={"judin.jaroslav@gmail.com"}
      show={this.state.shareViewVisible}
      toggleShow={() => this.toggleShareView(!this.state.shareViewVisible)}
      buttonLabel='Send'
    />
  </View>);

  render() {
    const { link, isActive, isEdit, onPressLink, toggleShowRenameList } = this.props;
    const rowStyles = [
      styles.option,
      { opacity: this._animated },
      {
        height: this._animated.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 68], // 68 - line height
          extrapolate: 'clamp',
        }),
      },
    ];
    if (isActive) {
      rowStyles.push(styles.activeOption);
    }

    return (
      <Animated.View
        key={link.id}
        style={rowStyles}>
        <TouchableOpacity
          background={'#ccc'}
          style={{ flex: 1, overflow: 'hidden', }}
          onPress={onPressLink(link)}>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15 }}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="ios-list" size={22} color={isActive ? "#000" : "#ccc"} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                {link.label}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {isEdit && !link.readonly &&
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-send'
                color='#1284f7'
                click={this.showShareView}
              />
            </View>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-create'
                click={() => toggleShowRenameList(link.id)}
                color='#1284f7'
              />
              {this.state.shareViewVisible && this.renderShare()}
            </View>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-trash'
                click={() => {
                  console.log('delete a list', link.id);
                  this.askDelete(link.id);
                }}
                color='#ff3b30' />
            </View>
          </View>
        }
        {link.sharing &&
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-contacts'
                color='#1284f7'
                click={() => {
                  Alert.alert(
                    'Shared list',
                    'Shared with ' + link.sharing,
                    [
                      {
                        text: 'Stop sharing',
                        onPress: () => {
                          console.log('stop sharing action');
                          this.props.updateShared(this.props.link.id, null);
                        },
                        style: 'destructive'
                      },
                      {text: 'Cancel', onPress: () => console.log('OK Pressed'), style: 'cancel'},
                    ],
                    {cancelable: false},
                  );
                }}
              />
            </View>
          </View>
        }
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',

    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30,
      },
    })
  },
  activeOption: {
    backgroundColor: Colors.logoLightColor,
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});