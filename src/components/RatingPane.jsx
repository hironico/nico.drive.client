import { Component } from 'react';
import { Pane, StarIcon, StarEmptyIcon } from 'evergreen-ui';

export default class RatingPane extends Component {

    render = () => {
        let stars = [];

        let rating = this.props.rating ? this.props.rating : 0;
        let maxRating = this.props.maxRating ? this.props.maxRating : 5;
        if (maxRating < rating) {
            maxRating = rating;
        }

        let size = this.props.size ? this.props.size : 24;
        
        for(let index = 0; index < rating; index++) {
            const lightedStar = <StarIcon key={index} color="#FBE6A2" size={size}/>
            stars.push(lightedStar);
        }

        for(let index = rating; index < maxRating; index++) {
            const unlightedStar = <StarEmptyIcon key={index} color="#C7CED4" size={size}/>
            stars.push(unlightedStar);
        }

        return <Pane display="inline-fex" alignItems="center">
            {stars}
        </Pane>
    }
}