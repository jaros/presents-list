import React from 'react';
import {
  Animated,
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
import Colors from '../constants/Colors';
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
      showDone: true,
      scrollY: new Animated.Value(0),
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
    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.container}>
        <ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
           [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
         )}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardDismissMode='on-drag'
          >

          <View style={styles.listContainer}>

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
        <Animated.View style={[styles.header, {height: headerHeight}]}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/icon.png')
                  : require('../assets/images/icon_trans.png')
              }
              style={styles.welcomeImage}
            />
          </View>

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
                 placeholder="Type here to add item!"
                 onChangeText={(text) => this.setState({text: text})}
               />
            </View>
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
            color={Colors.logoMainColor}
            onPress={() => {
              this.setState(previousState => {
                console.log('toggle done', previousState.showDone);
                return {showDone: !previousState.showDone};
              });
            }}
            title={this.state.showDone ? "Hide done" : "Show done"}/>

        </Animated.View>

      </View>
    );
  }
}

const HEADER_MAX_HEIGHT = 290;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.tabBar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tabIconDefault,
    overflow: 'hidden',
  },
  welcomeContainer: {
    alignItems: 'center',
    minHeight: 50,
    height: '30%',
    marginTop: 40,
    marginBottom: 20,
  },
  welcomeImage: {
    minHeight: 50,
    height: '100%',
    resizeMode: 'contain',
    marginTop: 3,
    marginBottom: 5,
    marginLeft: -10,
  },
  listContainer: {
    marginTop: HEADER_MAX_HEIGHT,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
  },
  textInputContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    flexDirection: 'row',
    // width: '90%',
    flexWrap:'nowrap'
  },
  textInputField: {
    textAlign: 'center',
    flexGrow: 1
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
    // fontFamily: "Expletus Sans",
    fontWeight: '500',
    color: Colors.logoText
  },
});
