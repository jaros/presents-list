import React from 'react';
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Modal,
  Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import TodoItem from '../components/TodoItem';
import TextEdit from '../components/TextEdit';
import { AsyncStorage } from "react-native"
import { Header } from 'react-navigation';
import DoubleClick from 'react-native-double-tap';
import {todoItemsMetaList} from '../components/SelectListsView';

export default class NewListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showDone: true,
      metaList: todoItemsMetaList,
      currentList: todoItemsMetaList.links.find(it => it.id === todoItemsMetaList.active),
      modalListNameVisible: false,
    };

    this.loadMetaList();
    this.loadStoredItems();

    const willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        const params = payload.action.params;
        if (params && params.list && params.list !== this.state.currentList) {
          this.setState({
            currentList: params.list,
            onCurrentListUpdate: params.onUpdate,
            items: []
          }, this.loadStoredItems);
        }
      }
    );
  }

  listKey = () => {
    return this.state.currentList.id === 1 ? 'TODO_ITEMS' : 'TODO_ITEMS_' + this.state.currentList.id;
  }

  loadStoredItems = () => {
      AsyncStorage.getItem(this.listKey()).then(value => {
        if (value) {
          this.setState({
            items: JSON.parse(value)
          });
        }
      }).catch(err => console.log(err));
  };

  loadMetaList = () => {
      AsyncStorage.getItem('TODO_ITEMS_META_LIST').then(value => {
        if (value) {
          this.setState({
            metaList: JSON.parse(value)
          });
        }
      }).catch(err => console.log(err));
  };

  storeItems = () => {
    AsyncStorage.setItem(this.listKey(), JSON.stringify(this.state.items));
  };

  storePreferences = () => {
    AsyncStorage.setItem('TODO_SHOW_DONE', JSON.stringify(this.state.showDone));
  };

  toggleShowDoneItems = () => {
    this.setState(previousState => {
      return {showDone: !previousState.showDone};
    }, this.storePreferences);
  };

  deleteItem = (key) => {
    console.log('deleteting item...', key)
    this.setState(previousState => {
      return {
        items: previousState.items.filter(item => item.key !== key)
      }
    }, this.storeItems);
  };

  toggleItem = (key, isDone) => {
    this.setState(previousState => {
      return {
        items: previousState.items.map(item => {
          if (item.key === key) {
            item.done = isDone;
          }
          return item;
        })
      }
    }, this.storeItems);
  };

  addItem = (newValue) => {
    this.setState(previousState => {
      return {
        items: [{
            key: new Date().getTime(),
            text: newValue
          }]
          .concat(previousState.items)
      }
    }, this.storeItems);
    // Alert.alert('You tapped the button!');
  };

  showEditListName = (visible) => {
    this.setState({modalListNameVisible: visible});
  };

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        enabled
        keyboardVerticalOffset={Header.HEIGHT + 35}
        >

        <View style={{paddingTop: 10}}>

        <DoubleClick
          singleTap={() => {
            console.log("single tap");
          }}
          doubleTap={() => {
            console.log("double tap");
            this.showEditListName(true);
          }}
          delay={200}>
          <View style={{height: 44, alignItems: 'center', backgroundColor: Colors.logoLightColor}}>
            <Text style={{
              fontSize: 18,
              fontWeight: '500',
              padding: 13,
              color: Colors.logoText}}>
                {this.state.currentList.label}
            </Text>
          </View>
        </DoubleClick>
        <Modal
          animationType='slide'
          transparent={false}
          visible={this.state.modalListNameVisible}
          presentationStyle='pageSheet'
          >
          <View style={{marginTop: 22}}>
            <TextEdit
              onSave={(value) => {
                this.setState(previousState => {
                  return {
                    currentList: {
                      id: previousState.currentList.id,
                      label: value
                    }
                  }
                });
                this.showEditListName(false);
                if (this.state.onCurrentListUpdate) {
                  this.state.onCurrentListUpdate(value);
                }
              }}
              initValue={this.state.currentList.label}
              saveLabel='Save'
              textInputPlaceholder='Provide a name for current list'
            />
            <View>
              <Button
                onPress={() => {
                  this.showEditListName(false);
                }}
                title='Cancel'
                >
              </Button>
            </View>
          </View>
        </Modal>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardDismissMode='on-drag'
          >

          <View style={styles.listContainer}>

          {
            this.state.items
            .filter(item => !item.done || this.state.showDone)
            .map(item =>
              <TodoItem key={item.key}
                item={item}
                onDelete={this.deleteItem}
                onDone={this.toggleItem}
                />
            )
          }

          {
            (this.state.items.filter(it => it.done) || []).length !== 0 &&
            <Button
              color={Colors.logoMainColor}
              onPress={this.toggleShowDoneItems}
              title={this.state.showDone ? "Hide done" : "Show done"}/>
          }
          </View>
        </ScrollView>
        <View style={[styles.header]}>
          <TextEdit
            onSave={this.addItem}
            initValue=''
            saveLabel='Add note'
            textInputPlaceholder='Type here to add item!'
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  header: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.tabIconDefault,
  },
  listContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
  },

});
