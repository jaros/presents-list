
import React from 'react';
import { Text, View } from 'react-native';
import DoubleClick from 'react-native-double-tap';
import Colors from '../constants/Colors';

export default class ActiveListTitle extends React.Component {

  render() {
    return(
      <DoubleClick
        doubleTap={this.props.onDoubleTap}
        delay={200}>
        <View style={{height: 44, alignItems: 'center', backgroundColor: Colors.logoLightColor}}>
          <Text style={{
            fontSize: 18,
            fontWeight: '500',
            padding: 13,
            color: Colors.logoText}}>
              {this.props.title}
          </Text>
        </View>
      </DoubleClick>
    )
  }
}
