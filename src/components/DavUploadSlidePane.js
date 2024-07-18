import { SideSheet, Position } from "evergreen-ui";

import DavUploadPane from './DavUploadPane';

export default function DavUploadSlidePane (props) {
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
        <DavUploadPane currentDirectory={props.currentDirectory} handleNavigate={props.handleNavigate} handleClose={props.handleClose} />
    </SideSheet>
}