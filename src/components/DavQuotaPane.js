import ProgressBar from "./progressbar/ProgressBar";

const { Pane, Text } = require("evergreen-ui");
const {  Component } = require("react");
const { DavConfigurationContext } = require("../AppSettings");

export default class DavQuotaPane extends Component {
    static contextType = DavConfigurationContext;
    

    render = () => {

        const max = this.context.userInfo.quota;
        const value = this.context.userInfo.quotaUsed;

        const quotaGB = (max / 1024 /1024 / 1024).toFixed(2);
        const usageGB = (value / 1024 /1024 / 1024).toFixed(2);

        return <Pane width="100%" padding={10} display="grid" gridTemplateRows="auto 1fr auto" border="default">
            <Text>Disk quota usage:</Text>
            <ProgressBar size="tiny" value={value} max={max} />
            <Text marginTop={15}>{`${usageGB} of ${quotaGB} GB used.`}</Text>
        </Pane>        
    }    
}