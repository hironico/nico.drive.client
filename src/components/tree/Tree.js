import { Component } from "react";

import { Pane } from "evergreen-ui";

import { DavConfigurationContext } from '../../AppSettings';

import  TreeFolder from './TreeFolder';

class Tree extends Component {
    static contextType = DavConfigurationContext;

    render = () => {
        return <Pane paddingTop={10} >
            {
                this.props.rootDirs.map((dir, index) => {
                    return <TreeFolder key={`${this.context.selectedUserRootDirectory.name}-${index}`} id={`${this.context.selectedUserRootDirectory.name}-${index}`} absolutePath={`/${dir.basename}`} basename={dir.basename} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                })
            }
        </Pane>
    }
}

export default Tree;