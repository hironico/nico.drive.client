import { DatabaseIcon, Menu } from "evergreen-ui";
import { Component } from "react";
import { DavConfigurationContext } from "../AppSettings";


export default class DavRootSelectorMenuGroup extends Component {
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

    changeUserRootDirectory = (newRootDir, handleCloseMenu) => {
        if (handleCloseMenu) {
            handleCloseMenu();
        }

        this.setState({
            rootDirLoading: true
        }, () => {
            this.context.setSelectedUserRootDirectory(newRootDir, this.changeCurrentDir());
        });        
    }

    render = () => {
        const selectedIndex = this.context.getSelectedUserRootDirectoryIndex();
        const items = this.context.userRootDirectories.map((rootDir, index) => {
            let intent = "default";
            if (selectedIndex === index) {
                console.log(`Rootdir named : ${rootDir.name} is the selected root dir.`)
                intent = "success";
            }
            return <Menu.Item key={index} icon={DatabaseIcon} intent={intent} onSelect={(evt) => this.changeUserRootDirectory(rootDir, this.props.handleCloseMenu)}>{rootDir.name}</Menu.Item>
        });

        return <Menu.Group title="Your drives">
            {items}
        </Menu.Group>
    }

}