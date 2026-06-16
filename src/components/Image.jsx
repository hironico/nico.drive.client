
import { Pane, Spinner, Alert, DocumentIcon } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';
import { getSocket, connectSocket } from '../lib/socketio';

import '../views/DavExplorerView.css';

export default class Image extends RegularFile {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            thumb: null,
            thumbError: null
        }
        // Holds the current thumb_ready listener so we can clean it up
        this._thumbReadyHandler = null;
    }

    componentDidMount = () => {
        this.setState({
            thumb: null,
            thumbError: null
        }, () => this.generateThumb());
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (JSON.stringify(prevProps.fileItem) !== JSON.stringify(this.props.fileItem)) {
            this.setState({
                thumb: null,
                thumbError: null
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

        // The requestId is computed from the same formula used by the server (thumb.ts),
        // so we can build it upfront, before the HTTP round-trip.
        const requestId = `${width}x${height}-${resizeFit}`;

        // ── STEP 1: join the socket room and register the listener FIRST ──────────
        // This must happen before the POST /thumb request is sent so that we are
        // already subscribed when the server emits thumb_ready. If the thumb is
        // generated very quickly the notification can arrive before the HTTP
        // response handler runs — joining late means we miss it permanently.
        //
        // Socket.IO client buffers events emitted while the connection is still
        // being established, so join_thumb_room is reliably delivered even on the
        // very first call when socket.connect() has not completed yet.
        const socket = connectSocket();

        socket.emit('join_thumb_room', {
            username: req.username,
            homeDir: req.homeDir,
            requestId: requestId
        });

        console.log(`Joined thumb room: thumb_${req.username}_${req.homeDir}_${requestId}`);

        // Build a named, filtered listener. All Image components share one socket
        // singleton; without filtering a single thumb_ready event would trigger
        // every waiting component regardless of which image it belongs to.
        const relativeFilename = req.filename.startsWith('/')
            ? req.filename.slice(1)
            : req.filename;

        const that = this;

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
                that._removeThumbReadyListener();

                if (notification.status === 'error') {
                    // Thumb generation failed server-side — stop retrying and show error
                    console.error('Socket.io: thumb generation failed for this image:', notification.error);
                    that.setState({ thumbError: notification.error || 'Thumbnail generation failed.' });
                } else {
                    console.log('Socket.io: thumb_ready received for this image:', notification);
                    that.generateThumb();
                }
            }
        };

        socket.on('thumb_ready', that._thumbReadyHandler);

        // ── STEP 2: NOW send the HTTP request ─────────────────────────────────────
        // The socket room is already joined, so even if the server generates the
        // thumb synchronously and emits thumb_ready before this fetch resolves,
        // the notification will be received and processed correctly.
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
                    // Thumb is being generated asynchronously. We are already in
                    // the room and listening — nothing else to do here.
                    console.log('Image thumb is being generated. Server locked. Waiting for socket.io notification...');
                } else {
                    // Thumb is ready (200) or an HTTP error occurred.
                    // Either way we no longer need the socket listener.
                    that._removeThumbReadyListener();

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
                        .catch(err => console.log(`Could not read thumb from data sent by server for file ${that.props.fileItem.filename}\nReason: ${err}`));
                }
            })
            .catch(err => {
                // Network / fetch error — clean up listener so we don't leak it
                that._removeThumbReadyListener();
                console.log(`Could not generate thumb for file ${that.props.fileItem.filename}\nReason: ${err}`);
            });
    }

    renderGridLabel = () => {
        return <></>
    }

    renderGridIcon = () => {
        if (this.state.thumbError !== null) {
            return <Pane display="flex" alignItems="center" justifyContent="center" padding={4}>
                <Alert intent="warning" title="Preview unavailable" />
            </Pane>
        } else if (this.state.thumb !== null) {
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
        if (this.state.thumbError !== null) {
            // In compact table view fall back to the generic document icon
            // (cannot use super.renderTableIcon() — arrow-function class properties
            //  are instance-assigned and not reachable via the prototype chain)
            return <DocumentIcon size={32} alignSelf="center" />;
        } else if (this.state.thumb !== null) {
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
        if (this.state.thumbError !== null) {
            return <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
                <Alert
                    intent="warning"
                    title="Preview unavailable"
                    marginBottom={32}
                >{this.state.thumbError}</Alert>
            </Pane>
        } else if (this.state.thumb !== null) {
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
