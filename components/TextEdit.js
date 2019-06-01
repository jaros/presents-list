import React from 'react';
import { Text, TextInput, View, TouchableHighlight, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default class TextEdit extends React.Component {

  constructor(props) {
    super(props);
    const initValue = this.funCheck(this.props.initValue) ? this.props.initValue() : this.props.initValue;
    this.state = {
      text: initValue,
    };
  }

  funCheck = (v) => typeof v === "function";

  onSavePressed = () => {
    if (this.state.text) {
      this.props.onSave(this.state.text);
      this.setState({
        text: ''
      });
    }
  };

  render() {
    const {onFocus, textInputPlaceholder, autoFocus, multiline} = this.props;
    return (
      <View style={styles.textInputContainer}>
        <View style={{
            flexDirection: 'row',
            minHeight: 35,
            width: 60,
            flexGrow: 1,
            borderWidth: 1,
            borderColor: Colors.logoLightColor,
          }}>
          <TextInput
             value={this.state.text}
             clearButtonMode='while-editing'
             selectTextOnFocus={false}
             autoFocus={!!autoFocus}
             multiline={!!multiline}
             onFocus={() => {
               if (this.props.onFocus) this.props.onFocus()
             }
             }
             style={styles.textInputField}
             placeholder={this.props.textInputPlaceholder}
             onChangeText={(text) => this.setState({text: text})}
           />
        </View>
          <TouchableHighlight style={{flexDirection: 'column'}} onPress={this.onSavePressed} underlayColor="white">
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
    padding: 10,
    flexDirection: 'row',
    flexWrap:'nowrap'
  },
  textInputField: {
    textAlign: 'center',
    flexGrow: 1
  },
  button: {
    flex: 1,
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.logoLightColor,
    borderWidth: 1,
    borderLeftWidth: 0,
    backgroundColor: Colors.logoLightColor,
  },
  buttonText: {
    paddingHorizontal: 10,
    fontWeight: '500',
    color: Colors.logoText
  },
});
