import React from 'react';
import { LayoutAnimation, Text, View, TouchableHighlight, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-swipeable';
import Colors from '../constants/Colors';
import { Haptic } from 'expo';
import { ANIMATION_DURATION } from '../constants/Layout';

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
            color={this.props.color || "black"} />
        </View>
      </TouchableHighlight>
    )
  }
}

const RowLayoutAnimation = {
  duration: ANIMATION_DURATION,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: this.props.item.done,
      rightActionActivated: false,
    };
  }

  toggleDone = () => {
    Haptic.impact('light');
    this.setState(previousState => {
      return { done: !previousState.done }
    }, () => {
      this.props.onDone(this.props.item.key, this.state.done);
    })
  }

  textStyle() {
    return this.state.done ? [styles.item, styles.done] : [styles.item, styles.itemColor];
  }

  doRemove = () => {
    LayoutAnimation.configureNext(RowLayoutAnimation);
    this.props.onDelete(this.props.item.key)
  }

  render() {
    const deleteActivated = this.state.rightActionActivated;
    const rightContent = [
      <TouchableHighlight
        onPress={this.doRemove}
        style={{ backgroundColor: '#ff3b30', flex: 1, justifyContent: "center", paddingHorizontal: 35 }}
      >
        <Ionicons
          name="ios-trash"
          size={deleteActivated ? 32 : 22}
          color="white" />
      </TouchableHighlight>
    ];

    return (
      <Swipeable
        rightButtons={rightContent}
        onRightButtonsOpenRelease={this.props.onOpen}
        onRightButtonsCloseRelease={this.props.onClose}
        swipeStartMinLeftEdgeClearance={10}
        swipeStartMinRightEdgeClearance={10}
        rightButtonWidth={80}
        rightActionActivationDistance={125}
        onRightActionActivate={() => {
          this.setState({ rightActionActivated: true });
          Haptic.impact('medium');
        }
        }
        onRightActionDeactivate={() => {
          this.setState({ rightActionActivated: false });
        }}
        onRightActionRelease={this.doRemove}
        onSwipeStart={this.props.onSwipeStart}
        onSwipeRelease={this.props.onSwipeRelease}
      >
        <View
          style={styles.row}
        >
          {
            this.state.done && <ActionIcon icon='ios-checkbox-outline' size={24} click={this.toggleDone} />
          }
          {
            !this.state.done && <ActionIcon icon='ios-square-outline' size={24} click={this.toggleDone} />
          }

          <View style={{
            flexDirection: 'row',
            width: 60,
            flexGrow: 1,
          }}>
            <TouchableOpacity
              onPress={this.toggleDone}
            >
              <Text style={this.textStyle()}>{this.props.item.text}</Text>
            </TouchableOpacity>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
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
