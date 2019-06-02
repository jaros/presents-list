import React from 'react';
import { Animated, Alert, AsyncStorage, Button, StyleSheet, Text, View, Platform, TouchableOpacity, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { ANIMATION_DURATION } from '../constants/Layout';
import { ActionIcon } from '../components/TodoItem';
import RenameList from '../components/RenameList';
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyDmELLjEJAx5hxcYphFGD3821WVSOTIsWw",
  authDomain: "check-tasks.firebaseapp.com",
  databaseURL: "https://check-tasks.firebaseio.com",
  projectId: "check-tasks",
  storageBucket: "check-tasks.appspot.com",
  messagingSenderId: "806572063767",
  appId: "1:806572063767:web:899014c783991a75"
};

const userid = 'jaros';

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
        <View style={{ paddingRight: 10 }}>
          <Button
            onPress={() => navigation.getParam('toggleEditAction')()}
            title={"" + navigation.getParam('headerRightBtnLabel', '')}
          />
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
    };

    this.loadAndSyncronizeMetaList().then(() => this.monitorRemoteMetaListChanges());
  }

  loadAndSyncronizeMetaList = async () => {
    const localData = await this.loadLocalMetaList();
    const remoteData = await this.loadRemoteMetaList();

    if (localData && !remoteData) {
      return firebase.database().ref('TODO_ITEMS_META_LIST/' + userid).set(metaList);
    } else if (!localData && remoteData) {
      this.setState({ metaList: remoteData });
      return AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(remoteData));
    } else if (!localData && !remoteData) {
      return initFirstTime();
    }

  }

  loadLocalMetaList = async () => {
    const value = await AsyncStorage.getItem('TODO_ITEMS_META_LIST');
    const dataExists = value && JSON.parse(value).links.length !== 0;
    if (dataExists) {
      const metaList = JSON.parse(value);
      this.setState({ metaList });
      return metaList;
    } else {
      return null;
    }
  }

  loadRemoteMetaList = async () => {
    let snapshot = await firebase.database().ref('TODO_ITEMS_META_LIST/' + userid).once('value');
    return snapshot.val();
  }

  monitorRemoteMetaListChanges = async () => {
    try {
      this.metaListRef = firebase.database().ref('TODO_ITEMS_META_LIST/' + userid).on('value', async (snapshot) => {
        let metaList = snapshot.val();
        if (!metaList) {
          this.initFirstTime();
        } else {
          console.log("meta list data: " + metaList);
          this.setState({ metaList });
          AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(metaList));
        }
      });
    }
    catch (err) {
      return console.log(err);
    }
  };

  initFirstTime = () => {
    const metaList = this.todoItemsMetaList();
    this.setState({ metaList });
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
    return this.state.metaList.links.find(it => it.id === this.state.metaList.active);
  };

  editableListName = () => {
    if (this.state.editableList) {
      const list = this.state.metaList.links.find(it => it.id === this.state.editableList);
      return list ? list.label : 'no list selected';
    } else {
      return 'List ' + (this.state.metaList.links.length + 1);
    }
  };

  todoItemsMetaList = () => {
    const newId = this.generateId()
    return {
      active: newId,
      links: [
        {
          id: newId,
          label: 'My list ONE',
          showDone: true,
        }
      ]
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

  saveMetaList = (metaList) => {
    if (!metaList) {
      metaList = this.state.metaList
    }
    AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(metaList));
    return firebase.database().ref('TODO_ITEMS_META_LIST/' + userid).set(metaList);
  };

  doListDelete = id => this.setState(previousState => {
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
    AsyncStorage.removeItem('TODO_ITEMS_' + id);
    if (this.state.metaList.links.length === 0) {
      this.initFirstTime()
    } else {
      this.saveMetaList();
    }
  });

  addNewList = (listName) => {
    const id = this.generateId();
    this.setState(previousState => {
      oldLinks = previousState.metaList.links;
      let newList = {
        id,
        label: listName,
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
    });
  };

  optionalAddNewlist = this.toggleShowRenameList;

  toggleEditButton = () => {
    const isEdit = !this.state.edit
    this.setState({ edit: isEdit });
    this.props.navigation.setParams({ headerRightBtnLabel: isEdit ? "Done" : "Edit" });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps='always'>
          {this.state.metaList.links.map(link =>
            <ListItem
              key={link.id}
              link={link}
              isActive={link.id == this.state.metaList.active}
              isEdit={this.state.edit}
              onPressLink={this._handlePressListLink}
              toggleShowRenameList={this.toggleShowRenameList}
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
    this.props.navigation.navigate('ActiveList', { name: link.label, id: link.id });
  };
}

class ListItem extends React.Component {

  constructor(props) {
    super(props);
    this._animated = new Animated.Value(0);
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

  getListContent = async (listId) => {
    const itemsToList = items => {
      if (items) {
        return "- " + JSON.parse(items).map(item => item.text).join("\n- ");
        // let result = '';
        // labels.forEach(label => result += (`- ${label}\n`));
        // return result;
      }
      return 'empty list';
    };

    try {
      return itemsToList(await AsyncStorage.getItem('TODO_ITEMS_' + listId));
    } catch (error) {
      console.error(error);
      return null;
    }
  };

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
        {isEdit &&
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-paper-plane'
                color='#1284f7'
                click={async () => {
                  Share.share(
                    {
                      title: `Share a list ${link.label} with friend`,
                      message: await this.getListContent(link.id)
                    }, {
                      subject: `Content of '${link.label}'`
                    }
                  );
                }}
              />
            </View>
            <View style={styles.optionIconContainer}>
              <ActionIcon
                icon='ios-create'
                click={() => toggleShowRenameList(link.id)}
                color='#1284f7'
              />
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
