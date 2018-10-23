import React from 'react';
import { Text, TextInput, View, TouchableHighlight, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default class TextEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
  }

  onSavePressed = () => {
    if (this.state.text) {
      this.props.onSave(this.state.text);
      this.setState({
        text: ''
      });
    }
  };

  render() {
    return (
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
             placeholder={this.props.textInputPlaceholder}
             onChangeText={(text) => this.setState({text: text})}
           />
        </View>
          <TouchableHighlight onPress={this.onSavePressed} underlayColor="white" style={styles.buttonWrapper}>
             <View style={styles.button}>
                <Text style={styles.buttonText}>{this.props.saveLabel}</Text>
              </View>
          </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    fontWeight: '500',
    color: Colors.logoText
  },
});
