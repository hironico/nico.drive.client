
import { Card, Icon, Pane, DocumentIcon, Link, InfoSignIcon } from 'evergreen-ui';
import { Component } from 'react';

export default class RegularFile extends Component {

    showDetails = () => {
        this.props.showDetails(this.props.fileItem);
    }

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
                <Pane style={styleThumb} background="tint2">
                    <Icon icon={DocumentIcon} size={48} color="success" />
                </Pane>
                <Pane display="inline-flex" style={{alignItems: 'center', justifyContent: 'left', width: '190px', height: '30px', margin: '5px', overflow: 'hidden'}}>
                    <Link href="#" onClick={(evt) => {this.showDetails()}}><Icon icon={InfoSignIcon} size={24} color="info" /></Link>&nbsp;
                    <Link href="#">{this.props.fileItem.basename}</Link>
                </Pane>    
            </Card>
        );
    }
}