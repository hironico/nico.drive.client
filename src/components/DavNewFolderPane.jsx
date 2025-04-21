import { Component } from "react";
import { Pane, TextInput, Checkbox, Button, toaster, Text } from "evergreen-ui";
import { DavConfigurationContext } from '../AppSettings';

class DavNewFolderPane extends Component {
  static contextType = DavConfigurationContext;

  constructor() {
    super();
    this.state = {
      newFolderName: '',
      moveToFolder: true
    }
  }

  createFolder = async () => {
    const separator = this.props.currentDirectory.endsWith('/') ? '' : '/';
    const newDir = `${this.props.currentDirectory}${separator}${this.state.newFolderName}`;
    let success = true;
    try {
      await this.context.selectedUserRootDirectory.davClient.createDirectory(newDir);
    } catch (error) {
      toaster.danger(`Cannot create ${newDir}. ${error.message}`);
      success = false;
    }

    this.setState({
      newFolderName: '',
      popoverShown: false
    }, () => {
      if (success) {
        const destDir = this.state.moveToFolder ? newDir : this.props.currentDirectory;
        this.props.handleNavigate(destDir);
      }
    });
  }

  render = () => {
    return <Pane
      display="grid"
      alignItems="center"
      justifyContent="center"
      gridTemplateColumns="auto auto"
      gridTemplateRows="auto auto auto"
      justifySelf="stretch"
      alignSelf="stretch"
      padding={10}  
    >
      <Text gridColumnStart="1" gridColumnEnd="span 2">New folder name:</Text>
      <TextInput justifySelf="stretch" gridColumnStart="1" gridColumnEnd="span 2" marginTop={5} value={this.state.newFolderName} onChange={(evt) => this.setState({ newFolderName: evt.target.value })} />
      <Checkbox justifySelf="stretch" gridColumnStart="1" gridColumnEnd="span 2" marginTop={5} disabled={this.state.newFolderName === ''} label="Move to new folder afer create" checked={this.state.moveToFolder} onChange={(evt) => this.setState({ moveToFolder: !this.state.moveToFolder })} />
      <Button is='div' marginTop={10} marginRight={5} alignSelf="left" appearance='primary' intent='info' disabled={this.state.newFolderName === ''} onClick={evt => this.createFolder()}>Create</Button>
      <Button is="div" marginTop={10} marginLeft={5} alignSelf="right" appearance='default' intent='none' onClick={this.props.handleClose}>Close</Button>
    </Pane>
  }
}

export default DavNewFolderPane;