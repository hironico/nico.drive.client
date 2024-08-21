import { Component } from 'react';

import Image from './Image';

import { DavConfigurationContext } from '../AppSettings';

import '../views/DavExplorerView.css';
import { Pane } from 'evergreen-ui';

export default class DavPhotoStrip extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            currentFileItemIndex: 0
        }
    }

    render = () => {

        const thumbs = this.props.fileItems.map((f, index) => {
            return <Image key={`photostrip-${index}`} displayMode="grid" fileItem={f} handleShowDetails={this.props.handleShowDetails} handleDelete={this.props.handleDelete} defaultAction={() => this.props.handleShowPhoto(index)} />
        })

        return <Pane background="black" display="inline-flex" alignSelf="center" justifySelf="center" paddingBottom={10}>
            {thumbs}
        </Pane>
    }

}