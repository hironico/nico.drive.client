
import { Card, Icon, Link, Pane, InfoSignIcon } from 'evergreen-ui';
import { Component } from 'react';

import { DavConfigurationContext } from '../AppSettings';

export default class Image extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            thumb: null
        }
    }

    componentDidMount = () => {
        this.setState({
            thumb: null
        }, () => this.generateThumb());
    }

    generateThumb = () => {
        const req = {
            "filename": this.props.fileItem.filename
        }

        const that = this;
        fetch(this.context.getThumbApiUrl(), { 
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.blob())
        .then(res => {
            var reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onloadend = function() {
                var base64data = reader.result;

                // put that into state
                that.setState(prev => {
                    return {
                        thumb: base64data
                    }
                });   
            }                   
        })
        .catch(err => console.log(`Could not generate thumb for file ${this.props.fileItem.filename}\nReason: ${err}`));
    }

    showDetails = () => {
        this.props.showDetails(this.props.fileItem);
    }

    render = () => {
        let styleThumb = {};
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                width: '200px',
                height: '200px',
                marginTop: '-15px'
            }        
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
                <div style={styleThumb}>&nbsp;</div>
                <Pane display="inline-flex" style={{alignItems: 'center', justifyContent: 'left', width: '190px', height: '30px', margin: '5px', overflow: 'hidden'}}>
                    <Link href="#" onClick={(evt) => {this.showDetails()}}><Icon icon={InfoSignIcon} size={24} color="info" /></Link>&nbsp;
                    <Link href="#">{this.props.fileItem.basename}</Link>
                </Pane>               
                
            </Card>
        );
    }
}