import { Component } from 'react';
import { DoubleChevronLeftIcon, DoubleChevronRightIcon, SearchIcon, InfoSignIcon, DownloadIcon, DeleteIcon, ChevronDownIcon } from 'evergreen-ui';
import { Pane, Text, EmptyState, Link, Popover, Menu, Button, Position } from 'evergreen-ui';

import Image from './Image';

import { DavConfigurationContext } from '../AppSettings';

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
            <Button intent="none" appearance="default">                
                <Text>{this.props.fileItems[this.state.currentFileItemIndex].basename} (File {this.state.currentFileItemIndex + 1} / {this.props.fileItems.length})</Text>
                <ChevronDownIcon size={16} marginLeft={10} />
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

        return <Pane display="grid" gridTemplateColumns="auto 1fr auto" gridTemplateRows="auto 1fr" height="auto" background='black'>
            <Pane background="black" padding={15} gridColumnStart="span 3" justifySelf="center" alignSelf="center">                
                {this.renderActionMenu()}
            </Pane>
            <Pane background="black" padding={10} justifySelf="center" alignSelf="center">
                <Link onClick={this.handlePreviousPhoto} textDecoration="none">
                    <DoubleChevronLeftIcon size={64} color='white'/>
                </Link>                        
            </Pane>
            <Pane background="black" width="auto" height="auto" >
                <Image displayMode='photo' fileItem={this.props.fileItems[this.state.currentFileItemIndex]} />
            </Pane>
            <Pane background="black" padding={10} justifySelf="center" alignSelf="center">
                <Link onClick={this.handleNextPhoto} textDecoration="none">
                    <DoubleChevronRightIcon size={64} color="white"/>
                </Link>                          
            </Pane>                    
        </Pane>
    }
}