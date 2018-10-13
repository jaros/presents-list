import React from 'react';
import {
  Image,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  TextInput,
} from 'react-native';
import { WebBrowser } from 'expo';

import TodoItem from '../components/TodoItem';
import { MonoText } from '../components/StyledText';

export default class NewListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      items: [],
      showDone: true
    };
  }

  deleteItem = (key) => {
    console.log('deleteting item...', key)
    this.setState(previousState => {
      return {
        items: previousState.items.filter(item => item.key !== key)
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/robot-dev.png')
                  : require('../assets/images/icon.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.textInputContainer}>

            <View style={{ flexDirection: 'row'}}>
              <TextInput
                 value={this.state.text}
                 style={{height: 60, borderWidth: 1, borderColor: '#7e7e7e', textAlign: 'center', flexGrow: 1}}
                 placeholder="Type here to add item!"
                 onChangeText={(text) => this.setState({text: text})}
               />
             <TouchableHighlight onPress={() => {
               this.setState(previousState => {
                 return {
                   items: previousState.text ?
                     [{
                       key: new Date().getTime(),
                       text: previousState.text
                     }].concat(previousState.items) :
                     previousState.items,
                   text: ''
                 }
               });
               // Alert.alert('You tapped the button!');
             }} underlayColor="white">
                 <View style={styles.button}>
                    <Text style={styles.buttonText}>Add note</Text>
                  </View>
               </TouchableHighlight>
            </View>

          <Button
            onPress={() => {
              this.setState(previousState => {
                console.log('toggle done', previousState.showDone);
                return {showDone: !previousState.showDone};
              });
            }}
            title={this.state.showDone ? "Hide done" : "Show done"}/>

          {
            this.state.items.map((item) =>
              <TodoItem key={item.key}
                item={item}
                showDone={this.state.showDone}
                onDelete={this.deleteItem}
                />
            )
          }
          </View>
        </ScrollView>
      </View>
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
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  textInputContainer: {
    padding: 10,
  },
  button: {
    marginBottom: 30,
    height: 60,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  },
});
