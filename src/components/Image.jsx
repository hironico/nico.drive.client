
import { Pane, Spinner, Alert } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';
import { getSocket, connectSocket } from '../lib/socketio';

import '../views/DavExplorerView.css';

export default class Image extends RegularFile {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            thumb: null
        }
        // Holds the current thumb_ready listener so we can clean it up
        this._thumbReadyHandler = null;
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

    componentWillUnmount = () => {
        this._removeThumbReadyListener();
    }

    _removeThumbReadyListener = () => {
        if (this._thumbReadyHandler) {
            const socket = getSocket();
            socket.off('thumb_ready', this._thumbReadyHandler);
            this._thumbReadyHandler = null;
        }
    }

    generateThumb = () => {
        // Clean up any pending listener from a previous attempt before starting fresh
        this._removeThumbReadyListener();

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
            "username": this.context.selectedUserRootDirectory.owner,
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
                    console.log('Image thumb is being generated. Server locked. Waiting for socket.io notification...');

                    // Connect the socket and join the thumb room
                    const socket = connectSocket();
                    const requestId = `${width}x${height}-${resizeFit}`;
                    const roomName = `thumb_${req.username}_${req.homeDir}_${requestId}`;

                    socket.emit('join_thumb_room', {
                        username: req.username,
                        homeDir: req.homeDir,
                        requestId: requestId
                    });

                    console.log('Joined thumb room:', roomName);

                    // Build a named, filtered listener so we only react to the notification
                    // that belongs to THIS specific image. All Image components share the
                    // same socket singleton; without filtering, a single thumb_ready event
                    // would trigger every waiting component regardless of which image it is for.
                    const relativeFilename = req.filename.startsWith('/')
                        ? req.filename.slice(1)
                        : req.filename;

                    that._thumbReadyHandler = (notification) => {
                        // Match on all identifying fields so we don't react to notifications
                        // meant for sibling Image components.
                        const filenameMatch =
                            notification.filename === req.filename ||
                            notification.filename.endsWith('/' + relativeFilename) ||
                            notification.filename.endsWith('\\' + relativeFilename);

                        if (
                            notification.username === req.username &&
                            notification.homeDir === req.homeDir &&
                            notification.requestId === requestId &&
                            filenameMatch
                        ) {
                            console.log('Socket.io: thumb_ready received for this image:', notification);
                            that._removeThumbReadyListener();
                            that.generateThumb();
                        }
                    };

                    socket.on('thumb_ready', that._thumbReadyHandler);

                } else {
                    res.blob()
                        .then(res => {
                            var reader = new FileReader();
                            reader.readAsDataURL(res);
                            reader.onloadend = function () {
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

    renderGridLabel = () => {
        return <></>
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
                margin: '0px',
                alignSelf: 'center'
            }
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Spinner height={16} width={16} alignSelf="center" />
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
            return <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
                <Alert
                    intent="none"
                    title="Picture is loading"
                    marginBottom={32}
                >Please be patient...</Alert>
            </Pane>
        }
    }
}
