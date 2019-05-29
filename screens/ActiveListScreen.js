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
import { Header } from 'react-navigation';
import { todoItemsMetaList } from '../components/SelectListsView';
import TodoItemEdit from '../components/TodoItemEdit';
import SortableList from 'react-native-sortable-list';

export default class ActiveListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  isDeleting = false; // todo workaround to handle async actions from swipeable component

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      metaList: {},
      currentList: {},
      isEdit: false,
      isSwiping: false,
      currentlyOpenSwipeable: null,
    };

    this.loadMetaList();

    const willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.loadMetaList();
      }
    );

    this.props.navigation.addListener(
      'willBlur',
      () => {
        this.setState({ isEdit: false });
        console.log('has left active list')
      }
    );
  }

  listKey = () => {
    return 'TODO_ITEMS_' + this.state.currentList.id;
  };

  loadStoredItems = () => {
    AsyncStorage.getItem(this.listKey()).then(value => {
      if (value) {
        this.assignItems(value);
      }
    }).catch(err => console.log(err));
  };

  assignItems = (jsonValue) => {
    let list = JSON.parse(jsonValue);
    if (this.notOrdered(list)) {
      console.log('adjust list order')
      list = list.map((item, idx) => ({
        ...item,
        order: (idx + 1) * 100
      }));
      this.storeItems(list);
    }
    this.setState({
      items: list
    });
  }

  notOrdered = (list) => list.some(it => it.order === undefined)

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

  storeItems = (list) => {
    if (list === undefined) {
      list = this.state.items
    }
    return AsyncStorage.setItem(this.listKey(), JSON.stringify(list));
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
    if (!this.state.items.some(item => item.key === key)) {
      return; // already deleted
    }
    console.log('deleting item')
    this.isDeleting = true;
    this.setState(previousState => {
      return {
        items: previousState.items.filter(item => item.key !== key),
        currentlyOpenSwipeable: null,
      }
    }, () => {
      console.log("the item was removed")
      this.isDeleting = false;
      this.storeItems();
    });
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
          text: newValue,
          order: (previousState.items.length + 1) * 100,
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

  // handleScroll = () => {
  //   const { currentlyOpenSwipeable } = this.state;

  //   if (currentlyOpenSwipeable) {
  //     currentlyOpenSwipeable.recenter();
  //   }
  // };

  onSwipeStart = () => this.setState({isSwiping: true});
  onSwipeRelease = () => this.setState({isSwiping: false});

  showActiveTodos = () => {
    const itemProps = {
      onOpen: (event, gestureState, swipeable) => {
        const {currentlyOpenSwipeable} = this.state;
        console.log("on open ", currentlyOpenSwipeable == null)
        if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable && !this.isDeleting) {
          currentlyOpenSwipeable.recenter();
        }

        if (swipeable) {
          this.setState({ currentlyOpenSwipeable: swipeable });
        }
      },
      onClose: () => {
        this.setState({ currentlyOpenSwipeable: null });
        // console.log("on close ")
      },
      onDone: this.toggleItem,
      onDelete: this.deleteItem,
      onSwipeStart: this.onSwipeStart,
      onSwipeRelease: this.onSwipeRelease,
    };
    return <ScrollView
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='always'
      ref={(ref) => { this.scrollView = ref; }}
      // onScroll={this.handleScroll}
      scrollEnabled={!this.state.isSwiping}
    >

      <View style={styles.listContainer}>

        {
          this.state.items
            .filter(item => !item.done || this.state.currentList.showDone)
            .sort(function (obj1, obj2) {
              // Ascending
              return obj1.order - obj2.order;
            })
            .map(item =>
              <TodoItem key={item.key}
                item={item}
                {...itemProps}
              />
            )
        }

        {/* {
          (this.state.items.filter(it => it.done) || []).length !== 0 &&
          <Button
            color={Colors.logoMainColor}
            onPress={this.toggleShowDoneItems}
            title={this.state.currentList.showDone ? "Hide done" : "Show done"} />
        } */}
      </View>
    </ScrollView>
  }

  showEditTodos = () => {
    let items = this.state.items.sort((obj1, obj2) => obj1.order - obj2.order)

    let onPositonChange = (key, currentOrder) => {
      let item = items[key];
      let newIdx = currentOrder.indexOf(key);
      let prevItemIdx = newIdx > 0 ? currentOrder[newIdx - 1] : -1;
      let nextItemIdx = newIdx < (currentOrder.length - 1) ? currentOrder[newIdx + 1] : -1;

      let prevOrder = prevItemIdx !== -1 ? items[prevItemIdx].order : 0;
      let nextOrder = nextItemIdx !== -1 ? items[nextItemIdx].order : (currentOrder.length + 1) * 100;

      let newItemOrder = (prevOrder + nextOrder) / 2;
      item.order = newItemOrder;
      this.updateItem(item.key, (item) => item.order = newItemOrder);
    }

    return <SortableList
      style={styles.container}
      contentContainerStyle={styles.listContainer}
      data={items}
      onReleaseRow={onPositonChange}
      renderRow={this._renderRow} />
  }

  _renderRow = ({ data, active }) => {
    return <TodoItemEdit data={data} active={active} onDelete={this.deleteItem} onChange={this.changeItemText} />
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
            paddingTop: 15,
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
              if (this.state.isEdit) {
                this.state.items.sort((obj1, obj2) => obj1.order - obj2.order).forEach(it => console.log(it))
              } else {
                this.setState({ currentlyOpenSwipeable: null });
              }
              this.setState((state, props) => ({ isEdit: !state.isEdit }));
            }}
            title={this.state.isEdit ? "Done" : "Edit"}
            accessibilityLabel="Edit"
          />
        </View>

        {!this.state.isEdit &&
          this.showActiveTodos()
        }
        {this.state.isEdit &&
          this.showEditTodos()
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
    // paddingLeft: 15,
    // paddingRight: 15,
    paddingBottom: 10,
  },

});
