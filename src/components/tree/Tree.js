import { Component } from "react";

import { Pane, EmptyState, Spinner } from "evergreen-ui";

import { DavConfigurationContext } from '../../AppSettings';

import  TreeFolder from './TreeFolder';

class Tree extends Component {
    static contextType = DavConfigurationContext;

    renderLoadingState = () => {
        return <EmptyState
            background="dark"
            title="Loading..."
            orientation="vertical"
            icon={<Spinner color="#C1C4D6" />}
            iconBgColor="#EDEFF5"
            description="Directories are loading."
        />
    }

    renderRootDirsTree = () => {
        return this.props.rootDirs.map((dir, index) => {
            return <TreeFolder key={`${this.context.selectedUserRootDirectory.name}-${index}`} id={`${this.context.selectedUserRootDirectory.name}-${index}`} absolutePath={`/${dir.basename}`} basename={dir.basename} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} level={0}/>
        });
    }

    render = () => {
        return <Pane className="davtree cool-scrollbars" paddingTop={10} overflow="scroll" marginLeft={5} >
                {this.props.isLoading && this.props.currentDirectory === '/' ? this.renderLoadingState() : this.renderRootDirsTree()}
        </Pane>
    }
}

export default Tree;