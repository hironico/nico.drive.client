
import { Component } from "react";
import { Pane, Heading } from 'evergreen-ui';

import Tree from './tree/Tree';
import DavRootSelector from "./DavRootSelector";

import { DavConfigurationContext } from '../AppSettings';
import DavQuotaPane from "./DavQuotaPane";

class DavSideBar extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            rootDirLoading: false
        }
    }

    render = () => {
        return <Pane className="davsidebar" gridTemplateRows="auto auto 1fr auto" gridTemplateColumns="auto" height="100vh" minWidth={170} overflow="hidden" background="gray300" elevation={0} >
            <Pane marginTop={15} marginLeft={10} marginRight={10} >
                <Heading size={900} color="neutral" textAlign="left">Nico's drive</Heading>
            </Pane>
            <Pane marginTop={15} marginLeft={10} marginRight={10}>
                <Heading size={600} color="neutral" textAlign="left">My drives:</Heading>
                <DavRootSelector handleNavigate={this.props.handleNavigate} width="100%" />
            </Pane>            
            <Pane display="grid" gridTemplateColumns="1fr" width="100%" overflow="hidden" marginTop={15} >
                <Tree key={this.context.selectedUserRootDirectory.name} rootDirs={this.props.rootDirs} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />    
            </Pane>
            <DavQuotaPane />
        </Pane>
    }
}

export default DavSideBar;