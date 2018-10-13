import React from 'react';
import {
  Alert,
  Image,
  Button,
  FlatList,
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
      words: [],
      showDone: false
    };
  }

  deleteItem = (key) => {
    console.log('deleteting item...', key)
    this.setState(previousState => {
      return {
        words: previousState.words.filter(item => item.key !== key)
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
                  : require('../assets/images/todo-logo.png')
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
                   words: previousState.text ?
                     [{
                       key: new Date().getTime(),
                       text: previousState.text
                     }].concat(previousState.words) :
                     previousState.words,
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
            this.state.words.map((item) =>
              <TodoItem key={item.key}
                item={item}
                showDone={this.state.showDone}
                onDelete={this.deleteItem}
                />
            )
          }
          </View>

          <View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}
          </View>
        </ScrollView>

      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
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
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
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
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b8',
  },
});
