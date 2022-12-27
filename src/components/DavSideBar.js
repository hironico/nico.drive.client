
import { Component } from "react";
import { Pane, Heading, Combobox, EmptyState, Spinner } from 'evergreen-ui';

import Tree from './tree/Tree';

import { DavConfigurationContext } from '../AppSettings';

class DavSideBar extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            rootDirLoading: false
        }
    }

    changeCurrentDir = () => {
        this.setState({
            rootDirLoading: false
        }, () => {
            this.props.handleNavigate('/');
        });        
    }

    changeUserRootDirectory = (newRootDir) => {
        this.setState({
            rootDirLoading: true
        }, () => {
            this.context.setSelectedUserRootDirectory(newRootDir, this.changeCurrentDir());
        });        
    }

    render = () => {
        return <Pane background="blueTint" elevation={0} padding={15} display="grid" gridTemplateRows="auto auto auto 1fr" gridTemplateColumns="auto" overflowX="scroll" height="100%">  
            <Pane background="blueTint">
                <Heading size={900} color="neutral" textAlign="left">My files</Heading>
            </Pane>
            <Pane background="blueTint" marginTop={15}>
                <Heading size={600} color="neutral" textAlign="left">File manager</Heading>
            </Pane>
            <Pane display="grid" gridTemplateColumns="1fr" width="100%">
                <Combobox
                    openOnFocus
                    initialSelectedItem={this.context.selectedUserRootDirectory}
                    items={this.context.userRootDirectories}
                    itemToString={item => (item ? item.name : '')}
                    onChange={selected => this.changeUserRootDirectory(selected)}
                    width="100%"
                />
            </Pane>
            <Tree key={this.context.selectedUserRootDirectory.name} rootDirs={this.props.rootDirs} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
        </Pane>
    }
}

export default DavSideBar;