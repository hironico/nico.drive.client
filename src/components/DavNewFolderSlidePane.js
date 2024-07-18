import { SideSheet, Position } from 'evergreen-ui';
import DavNewFolderPane from './DavNewFolderPane';

export default function DavNewFolderSlidePane(props) {
    return <SideSheet
        position={Position.TOP}
        isShown={props.isShown}
        onCloseComplete={() => props.handleClose()}
        preventBodyScrolling
        containerProps={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr'
        }}
    >
        <DavNewFolderPane handleNavigate={props.handleNavigate} handleClose={props.handleClose} currentDirectory={props.currentDirectory} />
    </SideSheet>
}