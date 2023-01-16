import { Component } from "react";
import { ChevronRightIcon, HomeIcon } from 'evergreen-ui';
import { Pane, Link } from 'evergreen-ui';

import '../views/DavExplorerView.css';

export default class DavBreadCrumb extends Component {

    render = () => {
        let path = this.props.currentDirectory;

        const chevronIcon = <ChevronRightIcon size={18} marginLeft={5} marginRight={5} />
        const homeIcon = <HomeIcon size={18} marginLeft={5} marginRight={5} />

        let currentDirs = path === '/' ? [''] : path.split('/');
        let navDirs = [];
        let breadCrumb = currentDirs.map((dir, index) => {
            const icon = index === 0 ? homeIcon : chevronIcon;
            navDirs.push(dir);
            const fullPath = navDirs.join('/');
            return <Link href="#" display="flex" alignItems="center" borderBottom="none" key={index + 1} onClick={() => {                
                this.props.handleNavigate(dir === '' ? '/' : fullPath);
            }}>{icon}{dir}</Link>
        });

        return <Pane className="davbreadcrumb" display="flex" padding={8} background="tint2">
            {breadCrumb}
        </Pane>
    }
}