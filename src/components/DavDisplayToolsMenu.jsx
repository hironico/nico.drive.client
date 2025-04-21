import { Popover, Menu, IconButton, Position } from "evergreen-ui";
import { CameraIcon, LayoutGridIcon, ThListIcon, AddIcon, CircleArrowUpIcon, MenuIcon } from "evergreen-ui";


export default function DavDisplayToolsMenu(props) {
    const handleDisplayModeAndClose = (displayMode, handleClose) => {
        props.handleDisplayMode(displayMode); 
        handleClose();
    }

    return <Popover
        justifySelf="end"
        position={Position.BOTTOM_RIGHT}
        content={({ close }) => (
            <Menu>
                <Menu.Group title="Display">
                    <Menu.Item icon={CameraIcon} onSelect={() => handleDisplayModeAndClose('photo', close)}>Photo</Menu.Item>
                    <Menu.Item icon={LayoutGridIcon} onSelect={() => handleDisplayModeAndClose('grid', close)}>Grid</Menu.Item>
                    <Menu.Item icon={ThListIcon} onSelect={() => handleDisplayModeAndClose('table', close)}>Table</Menu.Item>
                </Menu.Group>
                <Menu.Divider />
                <Menu.Group title="Tools">
                    <Menu.Item icon={AddIcon} onSelect={() => props.showCreateFolderPane()}>Create folder</Menu.Item>
                    <Menu.Item icon={CircleArrowUpIcon} onSelect={() => props.showFileUploadPane()}>Upload...</Menu.Item>
                </Menu.Group>
            </Menu>
        )}
    >

        <IconButton icon={MenuIcon}> ... </IconButton>
    </Popover>
}