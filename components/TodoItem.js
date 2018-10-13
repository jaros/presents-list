import React from 'react';
import { Text, View, Switch, TouchableHighlight, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ActionIcon extends React.Component {
  render() {
    return (
    <TouchableHighlight
      onPress={this.props.click}
      underlayColor="white">
      <Ionicons name={this.props.icon} size={44} color={this.props.color} />
    </TouchableHighlight>
    )
  }
}

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false
    };
  }

  componentWillUpdate(nextProps, nextState) {
      //console.log('update showDone', nextProps.showDone)
  }

  toggleDone = () => {
      this.setState(previousState => {
        return {done: !previousState.done}
      })
  }

  render() {
    if (!this.state.done || this.props.showDone)
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          {
            this.state.done && <ActionIcon icon='ios-checkbox-outline' color='green' click={this.toggleDone}/>
          }
          {
            !this.state.done && <ActionIcon icon='ios-square-outline' color='grey' click={this.toggleDone}/>
          }

          <Text style={styles.item}>{this.props.item.text}</Text>
          <TouchableHighlight
            onPress={() => {
              console.log('delete a note', this.props.item.key);
              this.props.onDelete(this.props.item.key);
            }}
            underlayColor="white">
            <Ionicons name="ios-close-circle-outline" size={44} color="red" />
          </TouchableHighlight>

        </View>
      )
    else
      return (<View/>)
  }
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    flexGrow: 1,
  },
});
