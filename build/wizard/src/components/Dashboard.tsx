import React, { useCallback } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

import NetworkBanner from "./shared/NetworkBanner";
import Header from "./shared/Header";
import SettingsForm from "./SettingsForm";
import MainPage from "./MainPage";
import AdminPage from "./AdminPage";
import NavigationBar from "./shared/NavigationBar";
import Welcome from "./shared/Welcome";

import logo from "../assets/PrysmStripe.png";
import defaultSettings from "./defaultsettings.json"
import { SettingsType } from "./shared/Types";
import { RestApi } from "./shared/RestApi";
import { SupervisorCtl } from "./shared/SupervisorCtl";
import { useWampSession } from "./shared/useWampSession"
import { DappManagerHelper } from "./shared/DappManagerHelper";
import FeeRecepientBanner from "./shared/FeeRecepientBanner";
import ExecutionEngineBanner from "./shared/ExecutionEngineBanner";
import CheckCheckPointSync from "./CheckCheckPointSync";

export const packageName = "prysm-beacon-chain-mainnet.avado.dnp.dappnode.eth";
export const validator_packageName = "eth2validator.avado.dnp.dappnode.eth";
export const packageUrl = "prysm-beacon-chain-mainnet.my.ava.do";

const Comp = () => {
    const wampSession = useWampSession();
    const dappManagerHelper = React.useMemo(() => wampSession ? new DappManagerHelper(packageName, wampSession) : null, [wampSession]);
    const validatorDappManagerHelper = React.useMemo(() => wampSession ? new DappManagerHelper(validator_packageName, wampSession) : null, [wampSession]);

    const [supervisorCtl, setSupervisorCtl] = React.useState<SupervisorCtl>();

    const [settings, setSettings] = React.useState<SettingsType>();

    const [restApi, setRestApi] = React.useState<RestApi | null>();
    const [keyManagerAPI, setKeyManagerAPI] = React.useState<RestApi>();

    const restApiUrl = `http://${packageUrl}:3500`
    const keyManagerAPIUrl = "http://eth2validator.my.ava.do:7500"

    const settingsPathInContainer = "/data/"
    const settingsFileName = "settings.json"

    const navigate = useNavigate();

    const applySettingsChanges = useCallback((newSettings: any) => {
        setSettings(newSettings)
        dappManagerHelper?.writeFileToContainer(settingsFileName, settingsPathInContainer, JSON.stringify(newSettings))
        //write settings to validator too (if installed)
        validatorDappManagerHelper?.writeFileToContainer(settingsFileName, "/root", JSON.stringify(newSettings))

        const checkEnvs = async (dappManagerHelper: DappManagerHelper, flagsThatShouldBeRemoved: (string | RegExp)[], restart = false) => {
            // Remove outdated environment variables
            const envs = await dappManagerHelper?.getEnvs()

            const extraOptsKey = 'EXTRA_OPTS' as keyof typeof envs;

            if (envs && extraOptsKey in envs) {
                const extra_opts: string = envs[extraOptsKey] ?? "";
                let new_extra_opts = extra_opts;

                // console.log(extra_opts)

                for (let flag of flagsThatShouldBeRemoved) {
                    new_extra_opts = new_extra_opts.replace(flag, "")
                }

                // console.log("after", new_extra_opts)
                if (new_extra_opts !== extra_opts)
                    dappManagerHelper?.writeEnv("EXTRA_OPTS", new_extra_opts.trim(), restart)
            }
        }

        if (dappManagerHelper)
            checkEnvs(dappManagerHelper, [
                "--http-web3provider=http://ethchain-geth.public.dappnode.eth:8545",
                /--grpc-gateway-corsdomain=http:\/\/.+,http:\/\/.+/
            ], true)

        if (validatorDappManagerHelper)
            checkEnvs(validatorDappManagerHelper, [
                "--graffiti=AVADO",
                "--beacon-rpc-provider=provider.beaconchain.eth.cloud.ava.do:4000",
                "--beacon-rpc-gateway-provider=provider.beaconchain.eth.cloud.ava.do:3500"
            ])


        //wait a bit to make sure the settings file is written
        setTimeout(function () {
            supervisorCtl?.callMethod('supervisor.restart', [])
            validatorDappManagerHelper?.restartPackage()
        }, 5000);
    }, [dappManagerHelper, validatorDappManagerHelper, supervisorCtl])

    React.useEffect(() => {
        if (wampSession && dappManagerHelper && !settings) {
            dappManagerHelper.getFileContentFromContainer(settingsPathInContainer + settingsFileName)
                .then(
                    (rawSettings) => {
                        if (rawSettings) {
                            const parsedSettings = JSON.parse(rawSettings)
                            if (parsedSettings) {
                                if (!parsedSettings.validators_proposer_default_fee_recipient) {
                                    parsedSettings.validators_proposer_default_fee_recipient = "" // force check on intial load after update
                                }
                                if (!parsedSettings.execution_engine) {
                                    parsedSettings.execution_engine = "ethchain-geth.public.dappnode.eth"
                                }
                                setSettings(parsedSettings)
                                console.log("Loaded settings: ", parsedSettings);
                            } else {
                                setSettings(defaultSettings)
                            }
                        } else {
                            console.log("Missing settings file, writing default settings")
                            applySettingsChanges(defaultSettings)
                            // navigate("/welcome");
                        }
                    }
                )
        }
    }, [wampSession, dappManagerHelper, settings, applySettingsChanges, navigate]);

    const [packages, setPackages] = React.useState<string[]>();
    React.useEffect(() => {
        if (wampSession && dappManagerHelper) {
            dappManagerHelper.getPackages().then((packages) => {
                setPackages(packages)
            })
        }
    }, [wampSession, dappManagerHelper]);

    const fetchApiToken = async (dappManagerHelper: DappManagerHelper, settings: SettingsType) => {
        const reschedule = async () => {
            console.log("reschedule")
            // wait 3 seconds and try again
            await new Promise(r => setTimeout(r, 2000));
            console.log("reschedule - timeout")
            fetchApiToken(dappManagerHelper, settings)
        }

        dappManagerHelper.getFileContentFromContainer(`/usr/share/nginx/wizard/auth-token.txt`, validator_packageName).then(
            (apiToken) => {
                console.log(apiToken)
                if (apiToken) {
                    setKeyManagerAPI(new RestApi(keyManagerAPIUrl, apiToken))
                } else {
                    reschedule()
                }
            }
        )
    }

    React.useEffect(() => {
        if (!wampSession || !settings || !dappManagerHelper) {
            setRestApi(null);
            return;
        }
        if (!restApi) {
            setRestApi(new RestApi(restApiUrl))
        }

        if (!keyManagerAPI) {
            fetchApiToken(dappManagerHelper, settings)
        }
    }, [wampSession, dappManagerHelper, settings, keyManagerAPI, restApi])

    React.useEffect(() => {
        const supervisorCtl = new SupervisorCtl(packageUrl, 5556, '/RPC2')
        setSupervisorCtl(supervisorCtl)
        supervisorCtl.callMethod("supervisor.getState", [])
    }, [])

    const [searchParams] = useSearchParams()
    const isAdminMode = searchParams.get("admin") !== null

    return (

        <div className="dashboard has-text-white">
            <NetworkBanner network={settings?.network ?? "mainnet"} />

            {!dappManagerHelper && (
                <section className="hero is-danger">
                    <div className="hero-body is-small">
                        <p className="has-text-centered">Avado Connection problem. Check your browser's console log for more details.</p>
                    </div>
                </section>
            )}

            <section className="has-text-white">
                <div className="columns is-mobile">
                    <div className="column">
                        <Header restApi={restApi} logo={logo} title="Avado Prysm" tagline="Prysm beacon chain and validator" wikilink="https://wiki.ava.do/en/tutorials/prysmvalidator" />

                        <NavigationBar/>

                        <FeeRecepientBanner validators_proposer_default_fee_recipient={settings?.validators_proposer_default_fee_recipient} navigate={navigate} />
                        <ExecutionEngineBanner execution_engine={settings?.execution_engine} wikilink="https://wiki.ava.do/en/tutorials/prysmvalidator" installedPackages={packages} />

                        <Routes>
                            <Route path="/" element={<MainPage settings={settings} restApi={restApi} keyManagerAPI={keyManagerAPI} dappManagerHelper={dappManagerHelper} installedPackages={packages} />} />
                            <Route path="/checksync" element={<CheckCheckPointSync restApi={restApi} />} />
                            
                            {dappManagerHelper && <Route path="/welcome" element={<Welcome logo={logo} title="Avado Prsym" dappManagerHelper={dappManagerHelper} />} />}
                            <Route path="/settings" element={<SettingsForm settings={settings} defaultSettings={defaultSettings} applySettingsChanges={applySettingsChanges} installedPackages={packages} isAdminMode={isAdminMode} />} />
                            {dappManagerHelper && <Route path="/admin" element={<AdminPage name="Prysm" supervisorCtl={supervisorCtl} restApi={restApi} dappManagerHelper={dappManagerHelper} />} />}
                        </Routes>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default Comp;
