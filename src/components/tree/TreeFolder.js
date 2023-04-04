
import React, {Component} from 'react';

import { Text, Spinner, Pane } from 'evergreen-ui';
import { Icon, FolderOpenIcon, ChevronDownIcon, ChevronRightIcon, FolderCloseIcon } from 'evergreen-ui';
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
      subDirs: [],
      loading: false
    }
  }

  getDirectoryContents = () => {
    this.setState({
      subDirs: [],
      loading: true
    }, () => this.doGetDirectoryContents());    
  }

  doGetDirectoryContents = async () => {
    let dirs = [];
    if (this.context.connectionValid) {
      const directoryItems = await this.context.selectedUserRootDirectory.davClient.getDirectoryContents(this.props.absolutePath);
      dirs = directoryItems.filter(item => { return item.type === 'directory' });      
    }
    this.setState({
      subDirs: dirs,
      loading: false,
      isOpen: dirs.length > 0
    });
  }

  handleToggle = (evt) => {
    if (this.state.subDirs.length === 0) {
      this.getDirectoryContents();
    } else {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  handleClick = (evt) => {
    if (this.state.subDirs.length === 0) {      
      this.getDirectoryContents();
    }

    this.props.handleNavigate(this.props.absolutePath);
  }

  renderSubDirectories = () => {
    return this.state.subDirs.map((dir, index) => {
      return <TreeFolder key={`${this.props.id}-${index}`} basename={dir.basename} absolutePath={`${this.props.absolutePath}/${dir.basename}`} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory}/>
    });
  }

  render = () => {
    
    const chevronIcon = this.state.isOpen ? ChevronDownIcon : ChevronRightIcon;
    const folderIcon = this.state.isOpen ? FolderOpenIcon : FolderCloseIcon;
    const nonBreakableBaseName = this.props.basename.replace(/\s/gu, '\u00a0');

    const plusIcon = this.state.loading ? <Spinner size={16} marginRight="10" /> : <Icon onClick={this.handleToggle} icon={chevronIcon} size={16} marginRight="10" cursor="pointer"/>;

    return <Pane>
              <div style={styles.folderLabel}>
                {plusIcon}
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