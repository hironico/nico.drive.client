import { Text } from "evergreen-ui";
import { Component } from "react";

export default class ProgressBar extends Component {

    render = () => {
        const max = this.props.max ? this.props.max : 100;
        const min = this.props.min ? this.props.min : 0;
        const value = this.props.value ? this.props.value : 0;
        const valuePct = value * 100 / (max-min);
        const color = this.props.color ? this.props.color : '#5C85FF'; // blue400
        const background = this.props.background ? this.props.background : '#c1c4d6'; // grey500
        const textColor = this.props.textColor ? this.props.textColor : '#F4F6FA'; // gray90        
        const label = this.props.label ? this.props.label : '';

        let size = this.props.size ? this.props.size : 'normal';

        // exposing those props is questionnable, could be removed in the future 
        const width = this.props.width ? this.props.width : '100%';
        
        let computedHeight = '36px';
        switch(size) {
            case 'normal':
                computedHeight = '36px';
                break;

            case 'small':
                computedHeight = '18px';
                break;

            case 'tiny':
                computedHeight = '9px';
                break;

            default:
                console.log('Invalid size property. Should be one of: normal, small, tiny');
                size = 'normal'
                computedHeight = '36px';
                break;
        }
        
        const height = this.props.height ? this.props.height : computedHeight;

        const styleContainer = {
            width: width,
            height: height,
            background: background,
            margin: '0px',
            borderColor: 'transparent',
            borderSize: '3px',
            borderRadius: '3px',
        }

        const styleInnerBar = {
            width: `${valuePct}%`,
            background: color,
            padding: '0px',
            margin: '0px',
            height: '100%',
            display: 'grid',
            gridTemplateRows: '1fr',
            gridTemplateColumns: '1fr',
            alignItems: 'center',
            borderColor: 'transparent',
            borderSize: '3px',
            borderRadius: '3px',
            paddingLeft: '16px',
            paddingRight: '16px'
        }

        const textToDisplay = <Text size={300} color={textColor} placeSelf="center">{label}</Text>;

        return <div style={styleContainer}>
            <div style={styleInnerBar}>{ size === 'normal' && textToDisplay }</div>
        </div>
    }
}