
import { Component } from 'react';
import { Popover, Pane, Text, TextInput, Button, AddIcon, Checkbox, toaster } from 'evergreen-ui';
import { DavConfigurationContext } from '../AppSettings';

export default class DavNewFolderButton extends Component {
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
    return <Popover
      content={({ close }) => {
        return <Pane
          padding={20}
          display="grid"
          alignItems="left"
          justifyContent="left"
          gridTemplateColumns="auto auto"
          gridTemplateRows="auto auto auto"
        >
          <Text gridColumnStart="1" gridColumnEnd="span 2">New folder name:</Text>
          <TextInput gridColumnStart="1" gridColumnEnd="span 2" width="100%" marginTop={5} value={this.state.newFolderName} onChange={(evt) => this.setState({ newFolderName: evt.target.value })} />
          <Checkbox gridColumnStart="1" gridColumnEnd="span 2" width="100%" marginTop={5} disabled={this.state.newFolderName === ''} label="Move to new folder afer create" checked={this.state.moveToFolder} onChange={(evt) => this.setState({ moveToFolder: !this.state.moveToFolder })} />
          <Button is='div' marginTop={10} marginRight={5} alignSelf="left" appearance='primary' intent='info' disabled={this.state.newFolderName === ''} onClick={evt => this.createFolder()}>Create</Button>
          <Button is="div" marginTop={10} marginLeft={5} alignSelf="right" appearance='default' intent='none' onClick={close}>Close</Button>
        </Pane>
      }}>
      <Pane display="flex" alignItems="center" cursor="pointer">
        <AddIcon size={18} marginRight={5} color="success"/>
        <Text className="button-label" color="success">Create folder</Text>
      </Pane>
      
    </Popover>
  }
}