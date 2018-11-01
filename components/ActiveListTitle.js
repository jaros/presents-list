
import React from 'react';
import { Text, View } from 'react-native';
import RenameList from './RenameList';
import DoubleClick from 'react-native-double-tap';
import Colors from '../constants/Colors';

export default class ActiveListTitle extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showRenameList: false,
    };
  }

  toggleShowRenameList = () => {
    this.setState(previousState => { return {showRenameList: !previousState.showRenameList}});
  };

  render() {
    return(
      <View style={{paddingTop: 10}}>
        <DoubleClick
          doubleTap={this.toggleShowRenameList}
          delay={200}>
          <View style={{
            marginHorizontal: 20,
            padding: 0,
            borderBottomColor: Colors.tabIconDefault,
            borderBottomWidth: 1,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '500',
              padding: 5,
              color: Colors.tabIconDefault}}>
                {this.props.title}
            </Text>
          </View>
        </DoubleClick>
        <RenameList
          onUpdate={this.props.onUpdate}
          initValue={this.props.title}
          show={this.state.showRenameList}
          toggleShow={this.toggleShowRenameList}
        />
      </View>
    )
  }
}
