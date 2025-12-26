
import { Component } from "react";
import { Pane, Heading, IconButton, ShareIcon, CogIcon } from 'evergreen-ui';
import { useNavigate } from 'react-router';

import Tree from './tree/Tree';
import DavRootSelector from "./DavRootSelector";

import { DavConfigurationContext } from '../AppSettings';
import DavQuotaPane from "./DavQuotaPane";

class DavSideBar extends Component {
    static contextType = DavConfigurationContext;

    handleNavigateToRootDirs = () => {
        this.props.navigate('/rootdirs');
    };

    render = () => {
        return <Pane className="davsidebar" gridTemplateRows="auto auto 1fr auto" gridTemplateColumns="auto" height="100vh" minWidth={170} overflow="hidden" background="gray300" elevation={0} >
            <Pane marginTop={15} marginLeft={10} marginRight={10} >
                <Heading size={900} color="neutral" textAlign="left">Nico's drive</Heading>
            </Pane>
            <Pane marginTop={15} marginLeft={10} marginRight={10}>
                <Heading size={600} color="neutral" textAlign="left">My drives:</Heading>
                <Pane display="flex" alignItems="center" gap={8}>
                    <Pane flex={1}>
                        <DavRootSelector handleNavigate={this.props.handleNavigate} width="100%" />
                    </Pane>
                    <IconButton 
                        icon={CogIcon} 
                        onClick={this.handleNavigateToRootDirs}
                        appearance="minimal"
                        title="Manage directory shares"
                    />
                </Pane>
            </Pane>            
            <Pane display="grid" gridTemplateColumns="1fr" overflow="hidden" marginTop={15}>
                <Tree key={this.context.selectedUserRootDirectory.name} rootDirs={this.props.rootDirs} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} isLoading={this.props.isLoading}/>    
            </Pane>
            <DavQuotaPane />
        </Pane>
    }
}

export default DavSideBar;
