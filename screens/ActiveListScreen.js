import React from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Colors from '../constants/Colors';
import TodoItem from '../components/TodoItem';
import TextEdit from '../components/TextEdit';
import TodoItemEdit from '../components/TodoItemEdit';
import SortableList from 'react-native-sortable-list';
import { ANIMATION_DURATION } from '../constants/Layout';
import * as firebase from 'firebase';

export default class ActiveListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('name', 'Active'),
      headerTitleStyle: {
        fontSize: 22,
        fontWeight: '500',
        color: Colors.tintColor
      },
      headerRight: (
        <View style={{ paddingRight: 10 }}>
          <Button
            onPress={() => navigation.getParam('toggleEditAction')()}
            title={"" + navigation.getParam('headerRightBtnLabel')}
          />
        </View>
      ),
    };
  };

  isDeleting = false; // todo workaround to handle async actions from swipeable component

  constructor(props) {
    super(props);
    const listId = props.navigation.getParam('id', 'NO-ID');
    const listOwner = props.navigation.getParam('listOwner', 'NO-OWNER');
    this.state = {
      items: [],
      currentList: { showDone: true }, // mock currentList - we don't save meta property here
      listId: listId,
      listOwner: listOwner,
      isEdit: false,
      isSwiping: false,
      currentlyOpenSwipeable: null,
      userid: firebase.auth().currentUser.uid,
    };
    this.loadStoredItems();
  }

  componentDidMount() {
    this.props.navigation.setParams({
      toggleEditAction: this.toggleEditButton,
      headerRightBtnLabel: "Edit"
    });
  }

  componentWillUnmount() {
    this.itemsListener.off();
  }

  loadStoredItems = async () => {
    this.itemsListener = firebase.database().ref(`/TODO_ITEMS/${this.state.listOwner}/${this.state.listId}`);
    this.itemsListener.on('value', snapshot => {
      if (snapshot.val()) {
        console.log('got db list data', snapshot.val());
        this.assignItems(Object.values(snapshot.val()));
      }
    }, err => console.log(err));
  };

  assignItems = list => {
    if (this.notOrdered(list)) {
      console.log('adjust list order')
      list = list.map((item, idx) => ({
        ...item,
        order: (idx + 1) * 100
      }));
      this.storeItemsAll(list);
    }
    this.setState({
      items: list
    });
  }

  notOrdered = (list) => list.some(it => it.order === undefined)

  storeItemsAll = (list) => {
    if (list === undefined) {
      list = this.state.items
    }
    return firebase.database().ref('TODO_ITEMS/' + this.state.listOwner + '/' + this.state.listId).set(list);
  };

  toggleShowDoneItems = () => {
    this.setState(previousState => {
      let isShowDone = previousState.currentList.showDone;
      return { currentList: { showDone: !isShowDone } };
    });
  };

  deleteItem = (key) => {
    if (!this.state.items.some(item => item.key === key)) {
      return; // already deleted
    }
    console.log('deleting item')
    this.updateItemDb(key, null);
  };

  updateItemDb = (key, value) =>
    firebase.database().ref(`TODO_ITEMS/${this.state.listOwner}/${this.state.listId}/${key}`).set(value);

  updateItem = (key, apply) => {

    let item = this.state.items.find(item => item.key === key);

    const changedItem = apply(item);
    this.updateItemDb(key, changedItem);
  };

  toggleItem = (key, isDone) => {
    this.updateItem(key, item => ({ ...item, done: isDone }));
  };

  changeItemText = (key, value) => {
    this.updateItem(key, item => ({ ...item, text: value }));
  };

  addItem = (newValue) => {
    const newItem = {
      key: new Date().getTime(),
      text: newValue,
      order: (this.state.items.length + 1) * 100,
    };
    this.setState(previousState => {
      return {
        items: previousState.items.concat([newItem])
      }
    }, () => this.updateItemDb(newItem.key, newItem).then(() =>
      setTimeout(this.scrollView.scrollToEnd, ANIMATION_DURATION)
    ));
  };

  onSwipeStart = () => this.setState({ isSwiping: true });
  onSwipeRelease = () => this.setState({ isSwiping: false });

  showActiveTodos = () => {
    const itemProps = {
      onOpen: (event, gestureState, swipeable) => {
        const { currentlyOpenSwipeable } = this.state;
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
      },
      onDone: this.toggleItem,
      onDelete: this.deleteItem,
      onSwipeStart: this.onSwipeStart,
      onSwipeRelease: this.onSwipeRelease,
    };
    const itemsToShow = this.state.items
      .filter(item => !item.done || this.state.currentList.showDone)
      .sort(function (obj1, obj2) {
        // Ascending
        return obj1.order - obj2.order;
      });
    const todos = itemsToShow.map(item =>
      <TodoItem key={item.key}
        item={item}
        {...itemProps}
      />
    );
    console.log('rerendering', itemsToShow);
    return <ScrollView
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.listContainer}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='always'
      ref={(ref) => { this.scrollView = ref; }}
      scrollEnabled={!this.state.isSwiping}
    >

      <View style={styles.listContainer}>

        {
          todos
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
      this.updateItem(item.key, item => ({ ...item, order: newItemOrder }));
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

  toggleEditButton = () => {
    Keyboard.dismiss()
    if (this.state.isEdit) {
      this.state.items.sort((obj1, obj2) => obj1.order - obj2.order)
    } else {
      this.setState({ currentlyOpenSwipeable: null });
    }
    const newEditState = !this.state.isEdit
    this.setState({ isEdit: newEditState });
    this.props.navigation.setParams({ headerRightBtnLabel: newEditState ? "Done" : "Edit" });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        enabled
      >
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
  header: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.tabIconDefault,
    paddingBottom: 20
  },
  listContainer: {
    paddingBottom: 10,
  },

});
