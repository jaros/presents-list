import React from 'react';
import { Button, Text, TextInput, View, TouchableHighlight, StyleSheet, Modal } from 'react-native';
import TextEdit from '../components/TextEdit';
import Colors from '../constants/Colors';

export default class RenameList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.show}
        presentationStyle='pageSheet'
        >
        <View style={{marginTop: 22}}>
          <TextEdit
            onSave={(value) => {
              this.props.onUpdate(value);
              this.props.toggleShow();
            }}
            initValue={this.props.initValue}
            saveLabel='Save'
            textInputPlaceholder='Provide a name for current list'
          />
          <View>
            <Button
              onPress={() => {
                this.props.toggleShow();
              }}
              title='Cancel'
              >
            </Button>
          </View>
        </View>
      </Modal>
    )
  }

}