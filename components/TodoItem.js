import React from 'react';
import { Text, View, Dimensions, TouchableHighlight, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-swipeable';

export class ActionIcon extends React.Component {
  render() {
    return (
      <TouchableHighlight
        onPress={this.props.click}
        underlayColor="white">
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons
            name={this.props.icon}
            size={this.props.size || 28}
            color={this.props.color || styles.itemColor} />
        </View>
      </TouchableHighlight>
    )
  }
}

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: this.props.item.done,
      rightActionActivated: false,
    };
  }

  toggleDone = () => {
    this.setState(previousState => {
      return { done: !previousState.done }
    }, () => {
      this.props.onDone(this.props.item.key, this.state.done);
    })
  }

  textStyle() {
    return this.state.done ? [styles.item, styles.done] : [styles.item, styles.itemColor];
  }

  doRemove = () => this.props.onDelete(this.props.item.key)

  render() {
    const deleteActivated = this.state.rightActionActivated;
    const rightContent = [
      <TouchableHighlight
        onPress={this.doRemove}
        style={{ backgroundColor: deleteActivated ? '#8b0000' : '#ff3b30', flex: 1, justifyContent: "center", paddingHorizontal: 20 }}
      >
        <Text style={{ color: 'white' }}>Delte</Text></TouchableHighlight>
    ]

    const screenWidth = Math.round(Dimensions.get('window').width);

    return (
      <Swipeable
        rightButtons={rightContent}
        onRightButtonsOpenRelease={this.props.onOpen}
        onRightButtonsCloseRelease={this.props.onClose}
        swipeStartMinLeftEdgeClearance={10}
        swipeStartMinRightEdgeClearance={10}
        rigthButtonWidth={80}
        rightActionActivationDistance={175}
        onRightActionActivate={() => this.setState({rightActionActivated: true})}
        onRightActionDeactivate={() => {
          this.setState({rightActionActivated: false});
        }}
        onRightActionRelease={this.doRemove}
        onSwipeStart={this.props.onSwipeStart}
        onSwipeRelease={this.props.onSwipeRelease}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
            this.state.done && <ActionIcon icon='ios-checkbox-outline' size={24} click={this.toggleDone} color='#d9d9d9' />
          }
          {
            !this.state.done && <ActionIcon icon='ios-square-outline' size={24} click={this.toggleDone} />
          }

          <View style={{
            flexDirection: 'row',
            //height: 60,
            width: 60,
            flexGrow: 1,
          }}>
            <Text style={this.textStyle()}>{this.props.item.text}</Text>
          </View>
        </View>
      </Swipeable>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    fontSize: 18,
    minHeight: 44,
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  done: {
    color: '#d9d9d9',
    textDecorationLine: 'line-through',
    fontStyle: 'italic',
  },
  itemColor: {
    color: '#383636'
  }
});
