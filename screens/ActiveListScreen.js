import React from 'react';
import {
  AsyncStorage,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Colors from '../constants/Colors';
import TodoItem from '../components/TodoItem';
import TextEdit from '../components/TextEdit';
import ActiveListTitle from '../components/ActiveListTitle';
import { Header } from 'react-navigation';
import { todoItemsMetaList } from '../components/SelectListsView';

export default class ActiveListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      metaList: {},
      currentList: {},
      isEdit: false,
    };

    this.loadMetaList();

    const willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.loadMetaList();
      }
    );
  }

  listKey = () => {
    return 'TODO_ITEMS_' + this.state.currentList.id;
  };

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
      if (value && JSON.parse(value).links.length !== 0) {
        const meta = JSON.parse(value);
        this.setState({
          metaList: meta,
          currentList: meta.links.find(it => it.id === meta.active),
          items: []
        }, this.loadStoredItems);
      } else { // init first time
        this.setState({
          metaList: todoItemsMetaList,
          currentList: todoItemsMetaList.links[0],
          items: []
        }, this.saveMetaList);
      }
    }).catch(err => console.log(err));
  };

  saveMetaList = () => {
    console.log('saving metaList', this.state.metaList);
    AsyncStorage.setItem('TODO_ITEMS_META_LIST', JSON.stringify(this.state.metaList));
  };

  storeItems = () => {
    return AsyncStorage.setItem(this.listKey(), JSON.stringify(this.state.items));
  };

  toggleShowDoneItems = () => {
    this.setState(previousState => {
      let isShowDone = previousState.currentList.showDone;

      const objIndex = previousState.metaList.links.findIndex((obj => obj.id == previousState.currentList.id));
      previousState.metaList.links[objIndex].showDone = !isShowDone;

      return { metaList: previousState.metaList };
    }, this.saveMetaList);
  };

  deleteItem = (key) => {
    // console.log('deleteting item...', key)
    this.setState(previousState => {
      return {
        items: previousState.items.filter(item => item.key !== key)
      }
    }, this.storeItems);
  };

  updateItem = (key, apply) => {
    this.setState(previousState => {
      return {
        items: previousState.items.map(item => {
          if (item.key === key) {
            apply(item);
          }
          return item;
        })
      }
    }, this.storeItems);
  };

  toggleItem = (key, isDone) => {
    this.updateItem(key, (item) => item.done = isDone);
  };

  changeItemText = (key, value) => {
    this.updateItem(key, (item) => item.text = value);
  };

  addItem = (newValue) => {
    this.setState(previousState => {
      return {
        items: previousState.items.concat([{
          key: new Date().getTime(),
          text: newValue
        }])
      }
    }, () => this.storeItems().then(() => this.scrollView.scrollToEnd()));
  };


  onListNameUpdate = (value) => {
    this.setState(previousState => {
      const objIndex = previousState.metaList.links.findIndex((obj => obj.id == this.state.currentList.id));
      previousState.metaList.links[objIndex].label = value;
      return {
        metaList: {
          ...previousState.metaList,
          links: previousState.metaList.links
        },
        currentList: previousState.metaList.links[objIndex]
      }
    }, this.saveMetaList);
  };

  showActiveTodos = () => {
    return <ScrollView
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='always'
      ref={(ref) => { this.scrollView = ref; }}
    >

      <View style={styles.listContainer}>

        {
          this.state.items
            .filter(item => !item.done || this.state.currentList.showDone)
            .map(item =>
              <TodoItem key={item.key}
                item={item}
                onDelete={this.deleteItem}
                onDone={this.toggleItem}
                onChange={this.changeItemText}
              />
            )
        }

        {
          (this.state.items.filter(it => it.done) || []).length !== 0 &&
          <Button
            color={Colors.logoMainColor}
            onPress={this.toggleShowDoneItems}
            title={this.state.currentList.showDone ? "Hide done" : "Show done"} />
        }
      </View>
    </ScrollView>
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        enabled
        keyboardVerticalOffset={Header.HEIGHT + 35}
      >

        <View
          style={{
            marginHorizontal: 20,
            marginVertical: 10,
            padding: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{
            fontSize: 22,
            fontWeight: '500',
            padding: 5,
            color: Colors.tintColor
          }}>
            {this.state.currentList.label}
          </Text>
          <Button
            onPress={() => {
              console.log("show edit")
              Keyboard.dismiss()
              this.setState((state, props) => ({ isEdit: !state.isEdit }));
            }}
            title={this.state.isEdit ? "Done" : "Edit"}
            accessibilityLabel="Edit"
          />
        </View>

        {this.state.isEdit === false &&
          this.showActiveTodos()
        }

        {this.state.isEdit === false &&
          <View style={[styles.header]}>
            <TextEdit
              onSave={this.addItem}
              onFocus={() => { setTimeout(this.scrollView.scrollToEnd, 100); console.log('scroll to the end'); }}
              initValue=''
              saveLabel='Add note'
              textInputPlaceholder='Type here to add item!'
            />
          </View>
        }
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
    paddingBottom: 20
  },
  listContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
  },

});
