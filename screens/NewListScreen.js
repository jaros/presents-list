import React from 'react';
import {
  Animated,
  Image,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { WebBrowser } from 'expo';
import Colors from '../constants/Colors';
import TodoItem from '../components/TodoItem';
import { MonoText } from '../components/StyledText';
import { AsyncStorage } from "react-native"
import { Header } from 'react-navigation';

// import SegmentedControlTab from 'react-native-segmented-control-tab';

export default class NewListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      items: [],
      showDone: true,
      selectedIndex: 0,
      currentListId: 1,
      scrollY: new Animated.Value(0),
    };
    this.loadStoredItems();
    this.loadPreferences();

    const willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        const params = payload.action.params;
        if (params && params.listId && params.listId !== this.state.currentListId) {
          this.setState({
            currentListId: params.listId,
            items: []
          }, this.loadStoredItems);
        }
      }
    );
  }

  listKey = () => {
    return this.state.currentListId === 1 ? 'TODO_ITEMS' : 'TODO_ITEMS_' + this.state.currentListId;
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

  loadPreferences = () => {
      AsyncStorage.getItem('TODO_SHOW_DONE').then(value => {
        if (value) {
          this.setState({
            showDone: JSON.parse(value)
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

  addItem = () => {
    if (this.state.text) {
      this.setState(previousState => {
        return {
          items: [{
              key: new Date().getTime(),
              text: previousState.text
            }]
            .concat(previousState.items),
          text: ''
        }
      }, this.storeItems);
    }

    this.setState(previousState => {
      return {
        items: previousState.text ?
          [{
            key: new Date().getTime(),
            text: previousState.text
          }].concat(previousState.items) :
          previousState.items,
        text: ''
      }
    });
    // Alert.alert('You tapped the button!');
  };

  handleIndexChange = (index) => {
    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        enabled
        keyboardVerticalOffset={Header.HEIGHT + 35}
        >

        <View style={{paddingTop: 10, paddingLeft: 5, paddingRight: 5}}>

        <Text>List id: {this.state.currentListId}</Text>

        {/* <SegmentedControlTab
          values={['One', 'Two', 'Three', 'Four', 'Five', 'Six']}
          selectedIndex={this.state.selectedIndex}
          onTabPress={this.handleIndexChange}
          activeTabStyle={{
            backgroundColor: Colors.logoLightColor
          }}
          tabStyle={{
            borderColor: Colors.logoMainColor
          }}
          tabTextStyle={{
            color: Colors.logoMainColor
          }}
        /> */}
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
          <View style={styles.textInputContainer}>
            <View style={{
                flexDirection: 'row',
                height: 60,
                width: 60,
                flexGrow: 1,
                borderWidth: 1,
                borderColor: Colors.logoLightColor,
              }}>
              <TextInput
                 value={this.state.text}
                 clearButtonMode='while-editing'
                 autoFocus={true}
                 style={styles.textInputField}
                 placeholder="Type here to add item!"
                 onChangeText={(text) => this.setState({text: text})}
               />
            </View>
           <TouchableHighlight onPress={this.addItem} underlayColor="white" style={styles.buttonWrapper}>
               <View style={styles.button}>
                  <Text style={styles.buttonText}>Add note</Text>
                </View>
             </TouchableHighlight>
          </View>

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
    paddingTop: 10,
  },
  textInputContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap:'nowrap'
  },
  textInputField: {
    textAlign: 'center',
    flexGrow: 1
  },
  buttonWrapper: {
    height: 60,
  },
  button: {
    marginBottom: 30,
    height: 60,
    alignItems: 'center',
    borderColor: Colors.logoLightColor,
    borderWidth: 1,
    borderLeftWidth: 0,
    backgroundColor: Colors.logoLightColor,
  },
  buttonText: {
    padding: 20,
    // fontFamily: "Expletus Sans",
    fontWeight: '500',
    color: Colors.logoText
  },
});
