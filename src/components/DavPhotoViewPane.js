import { Component } from 'react';
import { DoubleChevronLeftIcon, DoubleChevronRightIcon, SearchIcon, InfoSignIcon, DownloadIcon, DeleteIcon, ChevronDownIcon, CrossIcon } from 'evergreen-ui';
import { Pane, Text, EmptyState, Link, Popover, Menu, Button, Position } from 'evergreen-ui';

import Image from './Image';

import { DavConfigurationContext } from '../AppSettings';

import '../views/DavExplorerView.css';

export default class DavPhotoViewPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            currentFileItemIndex: 0
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.fileItems !== this.props.fileItems) {
            this.setState({
                currentFileItemIndex: 0
            })
        }
    }

    download = (fileItem) => {
        const dlLink = this.context.selectedUserRootDirectory.davClient.getFileDownloadLink(fileItem.filename);
        window.open(dlLink, '_blank');
    }

    handleNextPhoto = () => {
        if (this.state.currentFileItemIndex >= this.props.fileItems.length - 1) {
            return;
        } else {
            const plusOne = this.state.currentFileItemIndex + 1;
            this.setState({
                currentFileItemIndex: plusOne
            });
        }
    }

    handlePreviousPhoto = () => {
        if (this.state.currentFileItemIndex <= 0) {
            return;
        } else {
            const minusOne = this.state.currentFileItemIndex - 1;
            this.setState({
                currentFileItemIndex: minusOne
            });
        }
    }

    handleClose = () => {
        if (this.props.handleDisplayMode) {
            this.props.handleDisplayMode('table');
        }
    }

    renderActionMenu = () => {
        const fileItem = this.props.fileItems[this.state.currentFileItemIndex];
        return <Popover
            position={Position.BOTTOM_RIGHT}
            content={
                <Menu>
                    <Menu.Group>
                        <Menu.Item icon={InfoSignIcon} intent="info" onSelect={() => { this.props.handleShowDetails(fileItem) }}>Details...</Menu.Item>
                        <Menu.Item icon={DownloadIcon} intent="success" onSelect={() => { this.download(fileItem)} }>Download...</Menu.Item>
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.Item icon={DeleteIcon} intent="danger" onSelect={() => { this.props.handleDelete(fileItem)} }>Delete</Menu.Item>
                    </Menu.Group>
                </Menu>
            }            
        >
            <Button intent="none" appearance="default" iconAfter={ChevronDownIcon}>                
                <Text>{this.props.fileItems[this.state.currentFileItemIndex].basename} (File {this.state.currentFileItemIndex + 1} / {this.props.fileItems.length})</Text>
            </Button>
        </Popover>
    }

    render = () => {
        if (typeof this.props.fileItems === 'undefined' || this.props.fileItems.length === 0) {
            return <EmptyState
                        background="light"
                        title="There is no photo to display in this directory!"
                        orientation="horizontal"
                        icon={<SearchIcon color="#C1C4D6" />}
                        iconBgColor="#EDEFF5"
                        description="Switch to grid or table display mode to view the other files in this directory."
                    />
        }

        return <Pane display="grid"
                    gridTemplateColumns="auto 1fr auto"
                    gridTemplateRows="auto 1fr"
                    height="100vh"
                    width="100vw"
                    background="black"
                    position="absolute"
                    top="0px"
                    left="0px"
                    zIndex="4">
            <Pane background="black" padding={10} gridColumnStart="span 2" justifySelf="center" alignSelf="center">
                {this.renderActionMenu()}
            </Pane>
            <Pane background="black" padding={10} justifySelf="right" alignSelf="center">
                <Link onClick={this.handleClose} href="#" borderBottom="none">
                    <CrossIcon className="davphotoviewicon" />
                </Link>
            </Pane>
            <Pane background="black" padding={10} justifySelf="center" alignSelf="center">
                <Link onClick={this.handlePreviousPhoto} href="#" borderBottom="none">
                    <DoubleChevronLeftIcon className="davphotoviewicon" />
                </Link>                        
            </Pane>
            <Pane background="black" width="auto" height="auto" >
                <Image displayMode='photo' fileItem={this.props.fileItems[this.state.currentFileItemIndex]} />
            </Pane>
            <Pane background="black" padding={10} justifySelf="center" alignSelf="center">
                <Link onClick={this.handleNextPhoto} href="#" borderBottom="none">
                    <DoubleChevronRightIcon className="davphotoviewicon" />
                </Link>                          
            </Pane>                    
        </Pane>
    }
}