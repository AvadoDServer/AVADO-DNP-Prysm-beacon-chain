import React, { useCallback } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

import NetworkBanner from "./shared/NetworkBanner";
import Header from "./shared/Header";
import SettingsForm from "./SettingsForm";
import MainPage from "./MainPage";
import AdminPage from "./AdminPage";
import NavigationBar from "./shared/NavigationBar";
import Welcome from "./shared/Welcome";

import { SettingsType } from "./shared/Types";
import { RestApi } from "./shared/RestApi";
import { useWampSession } from "./shared/useWampSession"
import { DappManagerHelper } from "./shared/DappManagerHelper";
import FeeRecepientBanner from "./shared/FeeRecepientBanner";
import ExecutionEngineBanner from "./shared/ExecutionEngineBanner";
import CheckCheckPointSync from "./shared/CheckCheckPointSync";

import server_config from "../server_config.json";


// http://prysm-beacon-chain-prater.my.ava.do/

export const packagePrefix = `${server_config.name}-beacon-chain-${server_config.network}`;
export const packageName = `${packagePrefix}.avado.dnp.dappnode.eth`;
export const packageUrl = true ? `${packagePrefix}.my.ava.do` : `localhost`;


const Comp = () => {
    const wampSession = useWampSession();
    const dappManagerHelper = React.useMemo(() => wampSession ? new DappManagerHelper(packageName, wampSession) : null, [wampSession]);

    const [settings, setSettings] = React.useState<SettingsType>();
    const [defaultSettings, setDefaultSettings] = React.useState<SettingsType>();

    const [api, setApi] = React.useState<RestApi | null>();

    const apiUrl = `http://${packageUrl}:9999`;

    const capitalizeFirstLetter = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

    const getTitle = () => {
        const clientName = capitalizeFirstLetter(server_config.name)
        const networkName = capitalizeFirstLetter(server_config.network)
        switch (server_config.network) {
            case "gnosis": return `Avado ${clientName} ${networkName}`
            case "prater": return `Avado ${clientName} ${networkName} Testnet`
            default: return `Avado ${clientName}`;
        }
    }

    const getWikilink = () => {
        switch (server_config.network) {
            case "gnosis": return "https://docs.ava.do/packages/gnosis/"
            default: return `https://docs.ava.do/packages/${server_config.name}/`;
        }
    }

    const navigate = useNavigate();

    const applySettingsChanges = useCallback((newSettings: any) => {
        setSettings(newSettings)
        if (api) {
            api.post("/settings", newSettings, (res) => {
                console.log("Settings saved")
            }, (err) => {
                console.error("Settings not saved", err)
            });
        }
    }, [api])

    React.useEffect(() => {
        if (api) {
            api.get("/defaultsettings", (res) => {
                setDefaultSettings(res.data)
            }, (err) => {
                console.log("default", err)
            });
        }
    }, [api])

    React.useEffect(() => {
        if (wampSession && dappManagerHelper && !settings && api) {
            api.get("/settings", (res) => {
                console.log("settings", res.data)
                const parsedSettings = JSON.parse(res.data)
                if (parsedSettings) {
                    if (!parsedSettings.validators_proposer_default_fee_recipient) {
                        parsedSettings.validators_proposer_default_fee_recipient = "" // force check on intial load after update
                    }
                    if (!parsedSettings.execution_engine) {
                        parsedSettings.execution_engine = "ethchain-geth.public.dappnode.eth"
                    }
                    setSettings(parsedSettings)
                    // console.log("Loaded settings: ", parsedSettings);
                } else {
                    //ERROR TODO
                }
            }, (err) => {
                //ERROR TODO
            })
        }
    }, [wampSession, dappManagerHelper, settings, api, applySettingsChanges, navigate]);

    const [packages, setPackages] = React.useState<string[]>();
    React.useEffect(() => {
        if (wampSession && dappManagerHelper) {
            dappManagerHelper.getPackages().then((packages) => {
                setPackages(packages)
            })
        }
    }, [wampSession, dappManagerHelper]);

    React.useEffect(() => {
        if (!api) {
            setApi(new RestApi(apiUrl))
        }
        // eslint-disable-next-line
    }, [wampSession, dappManagerHelper])

    const [searchParams] = useSearchParams()
    const isAdminMode = searchParams.get("admin") !== null

    return (

        <div className="dashboard has-text-black maincontainer">
            <NetworkBanner network={server_config.network} />

            {!dappManagerHelper && (
                <section className="hero is-danger">
                    <div className="hero-body is-small">
                        <p className="has-text-centered">Avado Connection problem. Check your browser's console log for more details.</p>
                    </div>
                </section>
            )}

            <section className="has-text-black">
                <div className="columns is-mobile">
                    <div className="column">
                        <Header api={api} title={getTitle()} tagline={`${capitalizeFirstLetter(server_config.name)} beacon chain and validator`} wikilink={getWikilink()} />

                        <NavigationBar network={settings?.network ?? "mainnet"} />

                        <FeeRecepientBanner validators_proposer_default_fee_recipient={settings?.validators_proposer_default_fee_recipient} navigate={navigate} />
                        <ExecutionEngineBanner execution_engine={settings?.execution_engine} wikilink={getWikilink()} installedPackages={packages} client={capitalizeFirstLetter(server_config.name)} />

                        <Routes>
                            {api && (<Route path="/" element={<MainPage settings={settings} api={api} dappManagerHelper={dappManagerHelper} />} />)}
                            {dappManagerHelper && <Route path="/welcome" element={<Welcome title={getTitle()} dappManagerHelper={dappManagerHelper} />} />}
                            <Route path="/settings" element={<SettingsForm name={capitalizeFirstLetter(server_config.name)} settings={settings} defaultSettings={defaultSettings} applySettingsChanges={applySettingsChanges} installedPackages={packages} isAdminMode={isAdminMode} />} />
                            <Route path="/checksync" element={<CheckCheckPointSync api={api} network={server_config.network} packageUrl={packageUrl} />} />

                            {dappManagerHelper && <Route path="/admin" element={<AdminPage api={api} dappManagerHelper={dappManagerHelper} />} />}
                        </Routes>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default Comp;
