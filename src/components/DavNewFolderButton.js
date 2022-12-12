
import { Component } from 'react';
import { Popover, Pane, Text, TextInput, Button, FolderNewIcon, Checkbox } from 'evergreen-ui';
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
        const newDir = `${this.props.currentDirectory}/${this.state.newFolderName}`;
        await this.context.selectedUserRootDirectory.davClient.createDirectory(newDir);
        this.setState({
            newFolderName: '',
            popoverShown: false
        }, () => {
            const destDir = this.state.moveToFolder ? newDir : this.props.currentDirectory;
            this.props.handleNavigate(destDir);
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
            <TextInput gridColumnStart="1" gridColumnEnd="span 2" width="100%" marginTop={5} value={this.state.newFolderName} onChange={(evt) => this.setState({newFolderName: evt.target.value})} />
            <Checkbox gridColumnStart="1" gridColumnEnd="span 2" width="100%" marginTop={5} disabled={this.state.newFolderName === ''} label="Move to new folder afer create" checked={this.state.moveToFolder} onChange={(evt) => this.setState({moveToFolder: !this.state.moveToFolder})} />
            <Button is='div' marginTop={10} marginRight={5} alignSelf="left" appearance='primary' intent='info' disabled={this.state.newFolderName === ''} onClick={evt => this.createFolder()}>Create</Button>
            <Button is="div" marginTop={10} marginLeft={5} alignSelf="right" appearance='default' intent='none' onClick={close}>Close</Button>
          </Pane>
        }}>
        <Button is="div" marginLeft={12} marginRight={12} iconBefore={FolderNewIcon} appearance="primary" intent="info">New folder</Button>
      </Popover>
    }
}