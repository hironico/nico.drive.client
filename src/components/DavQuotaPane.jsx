import ProgressBar from "./progressbar/ProgressBar";

import { Pane, Text } from "evergreen-ui";
import {  Component }  from "react";
import { DavConfigurationContext } from "../AppSettings";

export default class DavQuotaPane extends Component {
    static contextType = DavConfigurationContext;   

    render = () => {

        // userInfo.quota is in GB from session, quotaUsed is in bytes
        const quotaGB = this.context.userInfo.quota; // in GB
        const quotaUsedBytes = this.context.quotaUsed; // in bytes
        const usageGB = quotaUsedBytes / (1024 * 1024 * 1024); // Convert bytes to GB
        const usageGBDisplay = usageGB.toFixed(2); // For display
        
        let statusText = '';
        let color = "#5C85FF"; // blue400
        let progressValue = usageGB;
        let progressMax = quotaGB;
        
        // Handle special cases
        switch(quotaGB) {
            case 0:
                progressValue = 100;
                progressMax = 100;
                statusText = 'READ ONLY access';
                color = "#D14343"; // red500
            break;

            case -1:
                progressValue = 100;
                progressMax = 100;                
                statusText = `Space used: ${usageGBDisplay} GB`;
                color = "#52BD95"; // green500
            break;

            default:                
                statusText = `${usageGBDisplay} of ${quotaGB} GB used.`;
                // Calculate ratio for color coding
                const ratio = usageGB / quotaGB;                
                if (ratio >= 0.75) {
                    color = "#FFB020"; // orange500
                } 
                if (ratio >= 0.90) {
                    color = "#D14343"; // red500
                }
            break;
        }

        return <Pane width="100%" padding={10} display="grid" gridTemplateRows="auto 1fr auto" elevation={1} background="tint1">
            <Text>Data space usage:</Text>
            <ProgressBar size="tiny" value={progressValue} max={progressMax} min={0} color={color} />
            <Text marginTop={10}>{statusText}</Text>
        </Pane>
    }    
}
