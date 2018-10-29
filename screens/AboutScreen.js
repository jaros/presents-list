import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>

      <View>
      <Text style={{fontSize: 24, color: '#788087', textAlign: 'center'}}>
        This is an open-source project
      </Text>

      <View style={{padding: 20}}>
        <Text style={styles.githubSource}>
          You’re welcome at &nbsp;
        </Text>
        <Text style={styles.githubSource}>
          <Ionicons name='logo-github' size={24} />
        </Text>
        <Text style={styles.githubSource}>
          https://github.com/jaros/check-list
        </Text>
      </View>
      </View>
    </View>;
  }
}

const styles = StyleSheet.create({
  githubSource: {
    fontSize: 18,
    color: Colors.logoLightColor,
    textAlign: 'center',
  },
});
