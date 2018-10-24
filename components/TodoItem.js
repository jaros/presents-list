import React from 'react';
import { Text, View, Switch, TouchableHighlight, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export class ActionIcon extends React.Component {
  render() {
    return (
    <TouchableHighlight
      onPress={this.props.click}
      underlayColor="white">
      <Ionicons name={this.props.icon} size={44} color={this.props.color || styles.itemColor} />
    </TouchableHighlight>
    )
  }
}

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: this.props.item.done
    };
  }

  toggleDone = () => {
      this.setState(previousState => {
        return {done: !previousState.done}
      }, () => {
        this.props.onDone(this.props.item.key, this.state.done);
      })
  }

  textStyle() {
    return this.state.done ? [styles.item, styles.done] : [styles.item, styles.itemColor];
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center'}}>
        {
          this.state.done && <ActionIcon icon='ios-checkbox-outline' click={this.toggleDone} color='#d9d9d9'/>
        }
        {
          !this.state.done && <ActionIcon icon='ios-square-outline' click={this.toggleDone}/>
        }

        <View style={{
          flexDirection: 'row',
          //height: 60,
          width: 60,
          flexGrow: 1,
          }}>
          <Text style={ this.textStyle() }>{this.props.item.text}</Text>
        </View>

        <ActionIcon icon='ios-close-circle-outline' click={() => {
          console.log('delete a note', this.props.item.key);
          this.props.onDelete(this.props.item.key);
        }}
        color='red'/>
      </View>
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
