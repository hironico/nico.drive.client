
import { Button, CaretDownIcon, DatabaseIcon, Menu, Popover, Position } from "evergreen-ui";
import { Component } from "react";
import { DavConfigurationContext } from '../AppSettings';
import DavRootSelectorMenuGroup from "./DavRootSelectorMenuGroup";


class DavRootSelector extends Component {
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
        return <Popover
                width="100%" 
                position={Position.BOTTOM_LEFT}
                content={({close}) => (
                    <Menu>
                        <DavRootSelectorMenuGroup handleNavigate={this.props.handleNavigate} handleCloseMenu={close}/>
                    </Menu>
                )}                
                >

                <Button name="drive" textAlign="left" width="100%" size="large" iconBefore={DatabaseIcon} iconAfter={CaretDownIcon}>{this.context.selectedUserRootDirectory.name}</Button>
        </Popover>
    }

}

export default DavRootSelector;