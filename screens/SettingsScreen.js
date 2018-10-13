import React from 'react';
import { WebBrowser } from 'expo';
import { View, Text } from 'react-native';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'About',
  };

  render() {
    return <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>

      <View>
      <Text style={{fontSize: 24, color: '#788087', textAlign: 'center'}}>
        This is open source TODO list
      </Text>

      <Text onPress={() => {
          WebBrowser.openBrowserAsync('https://github.com/jaros/presents-list')
          }
        } style={{fontSize: 18, color: '#2e78b8', textAlign: 'center', padding: 20}}>
        Feel free to check and contribute
      </Text>
      </View>
    </View>;
  }
}
