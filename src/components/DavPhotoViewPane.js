import { Component } from 'react';
import { DoubleChevronLeftIcon, DoubleChevronRightIcon, SearchIcon, CrossIcon } from 'evergreen-ui';
import { Pane, Text, EmptyState, Link } from 'evergreen-ui';

import Image from './Image';
import DavPhotoStrip from './DavPhotoStrip';

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

    handleShowPhotoAt = (index) => {
        this.setState({
            currentFileItemIndex: index
        });
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
                    gridTemplateRows="auto 1fr auto"
                    height="100vh"
                    width="100vw"
                    background="black"
                    position="absolute"
                    top="0px"
                    left="0px"
                    zIndex="4">
            <Pane background="black" padding={10} gridColumnStart="span 2" justifySelf="center" alignSelf="center">
                <Text>{this.props.fileItems[this.state.currentFileItemIndex].basename}</Text>
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

            <Pane className="cool-scrollbars" background="black" gridColumn="1 / -1" overflowX="scroll" overflowY="hidden" justifyItems="center" display="grid" gridTemplateRows="1fr" gridTemplateColumns="1fr">
                <DavPhotoStrip fileItems={this.props.fileItems} handleShowDetails={this.props.handleShowDetails} handleDelete={this.props.handleDelete} handleShowPhoto={this.handleShowPhotoAt}/>
            </Pane>
        </Pane>
    }
}