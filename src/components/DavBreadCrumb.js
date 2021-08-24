import { Component } from "react";
import { ChevronRightIcon, HomeIcon } from 'evergreen-ui';
import { Pane, Link } from 'evergreen-ui';

export default class DavBreadCrumb extends Component {

    render = () => {
        let path = this.props.currentDirectory;

        const chevronIcon = <ChevronRightIcon size={18} style={{ marginLeft: '5px', marginRight: '5px' }} />
        const homeIcon = <HomeIcon size={18} style={{ marginLeft: '5px', marginRight: '5px' }} />

        let currentDirs = path === '/' ? [''] : path.split('/');
        let navDirs = [];
        let breadCrumb = currentDirs.map((dir, index) => {
            const icon = index === 0 ? homeIcon : chevronIcon;
            navDirs.push(dir);
            const fullPath = navDirs.join('/');
            return <Link href="#" style={{ display: 'flex', alignItems: 'center' }} key={index + 1} onClick={() => {                
                this.props.handleNavigate(dir === '' ? '/' : fullPath);
            }}>{icon}{dir}</Link>
        });

        return <Pane display="flex" padding={8} background="blueTint">
            {breadCrumb}
        </Pane>
    }
}