
import React, {Component} from 'react';

import { Text, ChevronDownIcon, ChevronRightIcon, FolderCloseIcon } from 'evergreen-ui';
import { Icon, FolderOpenIcon } from 'evergreen-ui';
import { DavConfigurationContext } from '../../AppSettings';

const styles = {
    folderLabel: {
        display: 'grid',
        justifyItems: 'start',
        gridTemplateColumns: 'auto auto 1fr',
        span: {
          marginLeft: '5px'
        }
    },
    collapsibleOpen: {
        height: 'auto',
        overflow: 'hidden',
        paddingLeft: '20px'
    },
    collapsibleClosed: {
        height: '0px',
        overflow: 'hidden',
        paddingLeft: '20px'
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

  getDirectoryContents = async () => {
    let dirs = [];

    if (this.context.connectionValid) {
        const directoryItems = await this.context.davClient.getDirectoryContents(this.props.absolutePath);
        dirs = directoryItems.filter(item => { return item.type === 'directory' });

        this.setState({
          subDirs: dirs
        });
    }
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
      this.getDirectoryContents();
      this.setState({
        isOpen: true
      });
    }

    this.props.handleNavigate(this.props.absolutePath);
  }

  renderSubDirectories = () => {
    return this.state.subDirs.map((dir, index) => {
      return <TreeFolder key={`${this.props.id}-${index}`} basename={dir.basename} absolutePath={`${this.props.absolutePath}/${dir.basename}`} handleNavigate={this.props.handleNavigate} />
    });
  }

  render = () => {
    
    const plusIcon = this.state.isOpen ? ChevronDownIcon : ChevronRightIcon;
    const folderIcon = this.state.isOpen ? FolderOpenIcon : FolderCloseIcon;

    return <div>
              <div style={styles.folderLabel}>
                <Icon onClick={this.handleToggle} icon={plusIcon} size={16} marginRight="10" cursor="pointer"/>
                <div style={styles.folderLabel} onClick={this.handleClick}>
                  <Icon icon={folderIcon} size={16} color="#F7D154" cursor="pointer"/>
                  <Text style={styles.folderLabel.span} cursor="pointer">{this.props.basename}</Text>
                </div>
              </div>
              <div style={this.state.isOpen ? styles.collapsibleOpen : styles.collapsibleClosed}>
                {this.renderSubDirectories()}
              </div>
            </div>
  }
}

export default TreeFolder;