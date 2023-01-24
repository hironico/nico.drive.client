
import React, {Component} from 'react';

import { Text, ChevronDownIcon, ChevronRightIcon, FolderCloseIcon, Pane } from 'evergreen-ui';
import { Icon, FolderOpenIcon } from 'evergreen-ui';
import { DavConfigurationContext } from '../../AppSettings';

const styles = {
    folderLabel: {
        display: 'grid',
        justifyItems: 'start',
        gridTemplateColumns: 'auto auto 1fr',
        span: {
          marginLeft: '5px',
          whiteSpace: 'nowrap'
        },
        fontFamily: 'Lato'
    },
    collapsibleOpen: {
        height: 'auto',
        overflow: 'hidden',
        paddingLeft: '10px'
    },
    collapsibleClosed: {
        height: '0px',
        overflow: 'hidden',
        paddingLeft: '10px'
    }
  }

class TreeFolder extends Component {
  static contextType = DavConfigurationContext;

  constructor() {
    super();
    this.state = {
      isOpen: false,
      subDirs: []
    }
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (this.props.currentDirectory === null || typeof this.props.currentDirectory === 'undefined') {
      return;
    }
    
    // detect a current directory change
    if (prevProps.currentDirectory !== this.props.currentDirectory) {
      // detect if we jumped into this tree folder directory to refresh its contents
      // that may have changed folowing a directory create or delete operation but only if we are 'open' state
      if (this.props.currentDirectory === this.props.absolutePath && this.state.isOpen) {
        this.getDirectoryContents();
      } else {
        // if we create a folder and jumped into that new folder, we want to refresh the parent folder as well
        // to show the newly created folder.
        const lastIndex = this.props.currentDirectory.lastIndexOf('/');
        const parentFolder = this.props.currentDirectory.substring(0, lastIndex);
        if (this.props.absolutePath === parentFolder && this.state.isOpen) {
          this.getDirectoryContents();
        }
      }
    } 
  }

  getDirectoryContents = () => {
    this.setState({
      subDirs: []
    }, () => this.doGetDirectoryContents());    
  }

  doGetDirectoryContents = async () => {
    let dirs = [];
    if (this.context.connectionValid) {
      const directoryItems = await this.context.selectedUserRootDirectory.davClient.getDirectoryContents(this.props.absolutePath);
      dirs = directoryItems.filter(item => { return item.type === 'directory' });      
    }
    this.setState({
      subDirs: dirs
    });
  }

  handleToggle = (evt) => {
    this.setState({
      isOpen: !this.state.isOpen
    }, () => {
      if (this.state.isOpen && this.state.subDirs.length === 0) {
        this.getDirectoryContents();
      }
    });
  }

  handleClick = (evt) => {
    if (this.state.subDirs.length === 0) {      
      this.setState({
        isOpen: true
      }, () => this.getDirectoryContents());
    }

    this.props.handleNavigate(this.props.absolutePath);
  }

  renderSubDirectories = () => {
    return this.state.subDirs.map((dir, index) => {
      return <TreeFolder key={`${this.props.id}-${index}`} basename={dir.basename} absolutePath={`${this.props.absolutePath}/${dir.basename}`} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory}/>
    });
  }

  render = () => {
    
    const plusIcon = this.state.isOpen ? ChevronDownIcon : ChevronRightIcon;
    const folderIcon = this.state.isOpen ? FolderOpenIcon : FolderCloseIcon;
    const nonBreakableBaseName = this.props.basename.replace(/\s/gu, '\u00a0');

    return <Pane>
              <div style={styles.folderLabel}>
                <Icon onClick={this.handleToggle} icon={plusIcon} size={16} marginRight="10" cursor="pointer"/>
                <div style={styles.folderLabel} onClick={this.handleClick}>
                  <Icon icon={folderIcon} size={16} color="#F7D154" cursor="pointer"/>
                  <Text style={styles.folderLabel.span} cursor="pointer">{nonBreakableBaseName}</Text>
                </div>
              </div>
              <div style={this.state.isOpen ? styles.collapsibleOpen : styles.collapsibleClosed}>
                {this.renderSubDirectories()}
              </div>
            </Pane>
  }
}

export default TreeFolder;