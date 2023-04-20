
import React, {Component} from 'react';

import { Text, Spinner, Pane } from 'evergreen-ui';
import { Icon, FolderOpenIcon, ChevronDownIcon, ChevronRightIcon, FolderCloseIcon } from 'evergreen-ui';
import { DavConfigurationContext } from '../../AppSettings';

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
    if (!this.state.isOpen) {
      this.getDirectoryContents();
    } else {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  handleClick = (evt) => {    
    this.getDirectoryContents();

    this.props.handleNavigate(this.props.absolutePath);
  }

  renderSubDirectories = (level) => {
    return this.state.subDirs.map((dir, index) => {
      return <TreeFolder key={`${this.props.id}-${index}`} basename={dir.basename} absolutePath={`${this.props.absolutePath}/${dir.basename}`} handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} level={level}/>
    });
  }

  render = () => {
    
    const chevronIcon = this.state.isOpen ? ChevronDownIcon : ChevronRightIcon;
    const folderIcon = this.state.isOpen ? FolderOpenIcon : FolderCloseIcon;
    const nonBreakableBaseName = this.props.basename.replace(/\s/gu, '\u00a0');

    const level = this.props.level ? this.props.level : 0;
    const plusIcon = this.state.loading ? <Spinner size={16} marginRight="10" marginLeft={level * 10}/> : <Icon onClick={this.handleToggle} icon={chevronIcon} size={16} marginRight="10" marginLeft={level * 10} cursor="pointer"/>;

    // selected color = tint1
    const selected = this.props.absolutePath === this.props.currentDirectory;
    const bgColor = selected ? '#F9FAFC' : 'transparent';

    const subDirs = this.state.isOpen ? this.renderSubDirectories(level + 1) : <></>;

    return <Pane width="100%" display="grid" gridTemplateColumns="1fr">
              <Pane backgroundColor={bgColor} display="grid" 
                                              justifyItems="start" 
                                              alignItems="center" 
                                              gridTemplateColumns="auto auto 1fr"                                               
                                              borderRadius={3}
                                              margin={0}
                                              fontFamily="Lato"
                                              >
                {plusIcon}
                <Pane onClick={this.handleClick} display="grid" alignItems="center" justifyItems="start" gridTemplateColumns="auto 1fr" padding={5}>
                  <Icon icon={folderIcon} size={16} color="#F7D154" cursor="pointer"/>
                  <Text marginLeft={5} whiteSpace="nowrap" cursor="pointer">{nonBreakableBaseName}</Text>
                </Pane>
              </Pane>
              {subDirs}
            </Pane>
  }
}

export default TreeFolder;