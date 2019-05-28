import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import Colors from '../constants/Colors';
import SortableList from 'react-native-sortable-list';

class Row extends React.Component {

    constructor(props) {
      super(props);
  
      this._active = new Animated.Value(0);
  
      this._style = {
        ...Platform.select({
          ios: {
            transform: [{
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            }],
            shadowRadius: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 10],
            }),
          },
  
          android: {
            transform: [{
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            }],
            elevation: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 6],
            }),
          },
        })
      };
    }
  
    componentWillReceiveProps(nextProps) {
      if (this.props.active !== nextProps.active) {
        Animated.timing(this._active, {
          duration: 300,
          easing: Easing.bounce,
          toValue: Number(nextProps.active),
        }).start();
      }
    }
  
    render() {
     const {data, active} = this.props;
  
      return (
        <Animated.View style={[
          styles.row,
          this._style,
        ]}>
          <Text>{data.text}</Text>
        </Animated.View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    contentContainer: {
      paddingTop: 30,
    },
    header: {
      backgroundColor: Colors.tabBar,
      borderTopWidth: 1,
      borderTopColor: Colors.tabIconDefault,
      paddingBottom: 20
    },
    listContainer: {
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 10,
    },
  
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      height: 80,
      flex: 1,
      marginTop: 7,
      marginBottom: 12,
      borderRadius: 4,
  
  
      ...Platform.select({
        ios: {
          width: window.width - 30 * 2,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowOpacity: 1,
          shadowOffset: {height: 2, width: 2},
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
  