
import { Component } from "react";
import { Pane, Heading } from 'evergreen-ui';

import Tree from './tree/Tree';
import TreeFolder from './tree/TreeFolder';

class DavSideBar extends Component {
    render = () => {
        return <Pane background="blueTint" elevation={0} padding={15} display="grid" gridTemplateRows="auto auto 1fr" gridTemplateColumns="auto" overflowX="scroll" height="100%">  
            <Pane background="blueTint">
                <Heading size={900} color="neutral" textAlign="left">My files</Heading>
            </Pane>
            <Pane background="blueTint" marginTop={15}>
                <Heading size={600} color="neutral" textAlign="left">File manager</Heading>
            </Pane>
            <Tree>
                {this.props.rootDirs.map((dir, index) => {
                    return <TreeFolder key={`treefolder-${index}`} id={`treefolder-${index}`} absolutePath={`/${dir.basename}`} basename={dir.basename} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                })}
            </Tree>
        </Pane>
    }
}

export default DavSideBar;