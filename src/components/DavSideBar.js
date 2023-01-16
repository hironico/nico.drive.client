
import { Component } from "react";
import { Pane, Heading } from 'evergreen-ui';

import Tree from './tree/Tree';
import DavRootSelector from "./DavRootSelector";

import { DavConfigurationContext } from '../AppSettings';


class DavSideBar extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            rootDirLoading: false
        }
    }

    render = () => {
        return <Pane className="davsidebar" background="blueTint" elevation={0} minWidth={170}>
            <Pane background="blueTint">
                <Heading size={900} color="neutral" textAlign="left">Nico's drive</Heading>
            </Pane>
            <Pane background="blueTint" marginTop={15}>
                <Heading size={600} color="neutral" textAlign="left">My drives:</Heading>
            </Pane>
            <DavRootSelector handleNavigate={this.props.handleNavigate} width="100%" />
            <Pane display="grid" gridTemplateColumns="1fr" width="100%" overflowX="scroll" marginTop={15}>
                <Tree key={this.context.selectedUserRootDirectory.name} rootDirs={this.props.rootDirs} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />    
            </Pane>            
        </Pane>
    }
}

export default DavSideBar;