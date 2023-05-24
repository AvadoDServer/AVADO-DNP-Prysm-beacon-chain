import Validators from "./shared/Validators";
import { SettingsType } from "./shared/Types";
import { RestApi } from "./shared/RestApi";
import { DappManagerHelper } from "./shared/DappManagerHelper";

interface Props {
    api: RestApi| undefined | null
    settings: SettingsType| undefined
    dappManagerHelper: DappManagerHelper | null
}

const Comp = ({ api, settings, dappManagerHelper }: Props) => {
    return (
        <>
            {api && settings && dappManagerHelper ? (<Validators
                settings={settings}
                api={api}
            />)
                : <p>Loading...</p>}
        </>
    )
}

export default Comp;
