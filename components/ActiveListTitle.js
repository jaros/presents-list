
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
