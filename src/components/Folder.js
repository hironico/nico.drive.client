
import { Card, Icon, Text, Pane, FolderOpenIcon, Link } from 'evergreen-ui';
import { Component } from 'react';

export default class Folder extends Component {

    render = () => {
        let styleThumb = {
            width: '200px',
            height: '200px',
            marginTop: '-15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }

        return (
            <Card
                elevation={2}
                backgroundColor="white"
                width={200}
                height={240}
                margin={24}
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            >   
                <Link href="#" onClick={(evt) => this.props.navigate(this.props.fileItem.basename)}>             
                    <Pane style={styleThumb} background="tint2">
                        <Icon icon={FolderOpenIcon} size={48} color="#F7D154" />
                    </Pane>
                    <Pane display="inline-flex" alignItem="center" justifyContent="center" style={{width: '190px', height: '18px', margin: '5px'}}>
                        <FolderOpenIcon color="#F7D154"/>
                        <Text style={{overflow: 'hidden', maxWidth: '155px', maxHeight: '24px'}}>{this.props.fileItem.basename}</Text>                        
                    </Pane>                    
                </Link>
            </Card>
        );
    }
}