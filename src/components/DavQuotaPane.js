import ProgressBar from "./progressbar/ProgressBar";

const { Pane, Text } = require("evergreen-ui");
const {  Component } = require("react");
const { DavConfigurationContext } = require("../AppSettings");

export default class DavQuotaPane extends Component {
    static contextType = DavConfigurationContext;
    

    render = () => {

        let max = this.context.userInfo.quota;
        let value = this.context.userInfo.quotaUsed;
        const quotaGB = (max / 1024 /1024 / 1024).toFixed(2);
        const usageGB = (value / 1024 /1024 / 1024).toFixed(2);
        
        let statusText = '';
        let color = "#5C85FF"; // blue400
        switch(this.context.userInfo.quota) {
            case 0:
                max = 100;
                value = 100;
                statusText = 'READ ONLY access';
                color = "#D14343"; // red500
            break;

            case -1:
                max = 100;
                value = 100;                
                statusText = `Space used: ${usageGB} GB`;
                color = "#52BD95"; // green500
            break;

            default:                
                statusText = `${usageGB} of ${quotaGB} GB used.`;
                const ratio =  value / max;                
                if (ratio >= 0.75) {
                    color = "#FFB020"; // orange500
                } 
                if (ratio >= 0.90) {
                    color = "#D14343"; // red500
                }
            break;
        }

        return <Pane width="100%" padding={10} display="grid" gridTemplateRows="auto 1fr auto">
            <Text>Data space usage:</Text>
            <ProgressBar size="tiny" value={value} max={max} color={color} />
            <Text marginTop={10}>{statusText}</Text>
        </Pane>        
    }    
}