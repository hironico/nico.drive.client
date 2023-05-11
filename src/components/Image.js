
import { Pane, Spinner } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';

import '../views/DavExplorerView.css';

export default class Image extends RegularFile {
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

    componentDidUpdate = (prevProps, prevState) => {
        if (JSON.stringify(prevProps.fileItem) !== JSON.stringify(this.props.fileItem)) {
            this.setState({
                thumb: null
            }, () => this.generateThumb());
        }
    }

    generateThumb = () => {
        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization']; 

        let width;
        let height;
        let resizeFit;
        switch (this.props.displayMode) {
            case 'grid':
                width = 200;
                height = 200;
                resizeFit = 'cover';
                break;

            case 'table':
                width = 60;
                height = 60;
                resizeFit = 'cover';
                break;

            case 'photo':
                width = 1920;
                height = 1200;
                resizeFit = 'inside';
                break;

            default:
                console.warn(`Unrecognized display mode for Image: ${this.props.displayMode}`);
                width = 200;
                height = 200;
                resizeFit = 'cover';
                break;
        }

        const req = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename,
            "width": width,
            "height": height,
            "resizeFit": resizeFit
        }

        const that = this;
        fetch(this.context.getThumbApiUrl(), { 
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        })
        .then(res => {
            if (res.status === 202) {
                console.log('Image thumb is being gnerated. LOCKED by server. Trying un 1 sec.');
                setTimeout(() => {
                    this.generateThumb();
                }, 1000);
            } else {
                res.blob()
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
                .catch(err => console.log(`Could not read thumb from data sent by server for file ${this.props.fileItem.filename}\nReason: ${err}`));
            }            
        })
        .catch(err => console.log(`Could not generate thumb for file ${this.props.fileItem.filename}\nReason: ${err}`));      
    }

    renderGridIcon = () => {        
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',                
                width: '100%',
                height: '100%'
            }             
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center">
                       <Spinner />
                   </Pane>
        } 
    }

    renderTableIcon = () => {
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                width: '32px',
                height: '32px',
                margin: '0px'
            }
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center" height={24} width={24} padding={0} margin={0}>
                       <Spinner height={16} width={16} />
                   </Pane>
        }
    }

    renderPhoto = () => {  
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%'
            }             
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center" height={200}>
                        <Spinner color="white" />
                    </Pane>
        }
    }
}