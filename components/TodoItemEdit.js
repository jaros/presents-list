import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import { ActionIcon } from './TodoItem';
import { Ionicons } from '@expo/vector-icons';
import RenameList from './RenameList';

export default class TodoItemEdit extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showRenameList: false
    };

    this._active = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  toggleShowRenameList = () => this.setState(previousState => ({ showRenameList: !previousState.showRenameList }))

  onTextUpdate = (value) => {
    console.log('updated item to: ', value);
    this.props.onChange(this.props.data.key, value);
  };

  textStyle() {
    return this.props.data.done ? [styles.item, styles.done] : [styles.item, styles.itemColor];
  }

  render() {
    const { data, active } = this.props;

    return (
      <Animated.View style={[
        styles.row,
        this._style,
      ]}>
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="ios-reorder" size={22} color='#383636' />
        </View>

        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between' }}>
          <View style={{ maxWidth: 200 }}>
            <Text style={[this.textStyle()]}>{data.text}</Text>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center'
          }}>
            <ActionIcon icon='ios-trash' click={() => {
              console.log('delete a note', data.key);
              this.props.onDelete(data.key);
            }}
              size={24}
              color='#ff3b30' />

            <ActionIcon
              icon='ios-create'
              click={() => this.toggleShowRenameList()}
              color='#1284f7'
            />
          </View>
        </View>

        <RenameList
          onUpdate={this.onTextUpdate}
          initValue={data.text}
          show={this.state.showRenameList}
          toggleShow={this.toggleShowRenameList}
          autoFocus={true}
        />
      </Animated.View>
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

  done: {
    color: '#d9d9d9',
    textDecorationLine: 'line-through',
    fontStyle: 'italic',
  },
  itemColor: {
    color: '#383636'
  },

  item: {
    padding: 10,
    fontSize: 15,
    minHeight: 44,
    flexGrow: 1,
    flexWrap: 'wrap',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    //height: 44,
    flex: 1,
    //marginTop: 7,
    //marginBottom: 12,
    borderRadius: 4,
    backgroundColor: Colors.tabBar,

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

});
