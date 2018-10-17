import React from 'react';
import { WebBrowser } from 'expo';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'About',
  };

  render() {
    return <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>

      <View>
      <Text style={{fontSize: 24, color: '#788087', textAlign: 'center'}}>
        This is an open-source TODO list
      </Text>

      <Text onPress={() => {
          WebBrowser.openBrowserAsync('https://github.com/jaros/presents-list')
          }
        } style={{fontSize: 18, color: Colors.logoLightColor, textAlign: 'center', padding: 20}}>
        You’re welcome to contribute &nbsp;
        <Ionicons name='logo-github' size={24} />
      </Text>
      </View>
    </View>;
  }
}
