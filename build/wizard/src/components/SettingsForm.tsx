import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Formik, Field, Form, FieldArray } from 'formik';
import * as yup from 'yup';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Network, SettingsType, supportedNetworks } from "./shared/Types";

interface Props {
    settings: SettingsType | undefined,
    defaultSettings: SettingsType,
    applySettingsChanges: (settings: any) => void
    installedPackages: string[] | undefined
    isAdminMode?: boolean
}

const Comp = ({ settings, defaultSettings, applySettingsChanges, installedPackages, isAdminMode = false }: Props) => {

    const settingsSchema = yup.object().shape({
        validators_graffiti: yup.string().label("validators-graffiti").max(32, 'The graffiti can be maximum 32 characters long').optional(),
        validators_proposer_default_fee_recipient: yup.string().label("validators-proposer-default-fee-recipient").matches(/^0x[a-fA-F0-9]{40}$/).required('Required'),
    });

    type execution_engine = {
        name: string
        packagename: string
        ee_endpoint: string
        jwttokenpath: string
        network: Network
    }

    const execution_engines: execution_engine[] = [
        {
            name: "Geth Mainnet",
            packagename: "ethchain-geth.public.dappnode.eth",
            ee_endpoint: "http://ethchain-geth.my.ava.do:8551",
            jwttokenpath: "https://ethchain-geth.my.ava.do/jwttoken",
            network: "mainnet"
        }, {
            name: "Geth Goerli Testnet",
            packagename: "goerli-geth.avado.dnp.dappnode.eth",
            ee_endpoint: "http://goerli-geth.my.ava.do:8551",
            jwttokenpath: "https://goerli-geth.my.ava.do/jwttoken",
            network: "prater"
        }, {
            name: "Nethermind",
            packagename: "avado-dnp-nethermind.public.dappnode.eth",
            ee_endpoint: "http://avado-dnp-nethermind.my.ava.do:8551",
            jwttokenpath: "https://avado-dnp-nethermind.my.ava.do/jwttoken",
            network: "mainnet"
        }, {
            name: "Nethermind-goerli",
            packagename: "nethermind-goerli.avado.dnp.dappnode.eth",
            ee_endpoint: "http://nethermind-goerli.my.ava.do:8551",
            jwttokenpath: "https://nethermind-goerli.my.ava.do/jwttoken",
            network: "prater"
        }, {
            name: "Nethermind-gnosis",
            packagename: "nethermind-gnosis.avado.dnp.dappnode.eth",
            ee_endpoint: "http://nethermind-gnosis.my.ava.do:8551",
            jwttokenpath: "https://nethermind-gnosis.my.ava.do/jwttoken",
            network: "gnosis"
        }
    ]

    const [supportedExecutionEngines, setSpportedExecutionEngines] = React.useState<execution_engine[]>([]);
    React.useEffect(() => {
        if (installedPackages && settings) {
            if (installedPackages && settings) {
                const sees = execution_engines.filter(ee => ee.network === settings.network)
                if (isAdminMode)
                    console.log("Execution clients", settings.network, sees.map(ee => ee.packagename))
                setSpportedExecutionEngines(sees)
            }
        }
    }, [installedPackages, settings])

    const isInstalled = (execution_engine_name: string) => installedPackages?.includes(execution_engine_name) ?? false

    const applyChanges = (values: any) => {
        if (isAdminMode) console.log(values)
        const execution_engine = execution_engines.find(ee => ee.packagename === values.execution_engine) ?? execution_engines[0]
        values.ee_endpoint = execution_engine.ee_endpoint
        values.jwttokenpath = execution_engine.jwttokenpath
        if (isAdminMode) console.log(values)
        applySettingsChanges(values)
    }

    const confirmResetDefaults = () => {
        confirmAlert({
            message: `Are you sure you want to reset to the default settings?`,
            buttons: [
                {
                    label: 'Reset',
                    onClick: () => {
                        applySettingsChanges(defaultSettings)
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => { }
                }
            ]
        });
    }

    return <>
        <h2 className="title is-2">Settings</h2>
        {
            !settings && (
                <p>Loading settings...</p>
            )
        }
        {settings && (
            <div>
                <Formik
                    initialValues={settings}
                    validationSchema={settingsSchema}
                    validateOnMount
                    enableReinitialize
                    onSubmit={() => { }}
                >
                    {({ values, errors, touched, isValid, dirty, setValues }) => {
                        return <Form>
                            <div className="field">
                                <label className="label" htmlFor="validators_graffiti">Validators graffiti</label>
                                <div className="control">
                                    <Field className={"input" + (errors?.validators_graffiti ? " is-danger" : "")} id="validators_graffiti" name="validators_graffiti" placeholder="Avado Prysm" />
                                    {errors.validators_graffiti ? (
                                        <p className="help is-danger">{errors.validators_graffiti.toString()}</p>
                                    ) : null}
                                </div>
                            </div>

                            {supportedExecutionEngines && (
                                <div className="field">
                                    <label className="label" htmlFor="execution_engine">Execution Engine</label>
                                    <div className="control">
                                        {supportedExecutionEngines.map(ee =>
                                            <label className="radio" key={ee.packagename}>
                                                <Field type="radio" name="execution_engine" value={ee.packagename} disabled={!isInstalled(ee.packagename)} />
                                                {ee.name}
                                            </label>
                                        )}
                                        {!isInstalled(values.execution_engine) && (
                                            <p className="help is-danger">The selected execution engine is not installed.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* eslint-disable-next-line */}
                            <a id="validators_proposer_default_fee_recipient">
                                <div className="field">
                                    <label className="label" htmlFor="validators_proposer_default_fee_recipient">Default transaction fee recipient for the validators.
                                    The fee recipient can be overriden per validator by clicking the fee recipient value of any validator on the main page.
                                    </label>
                                    <div className="control">
                                        <Field className={"input" + (errors?.validators_proposer_default_fee_recipient ? " is-danger" : "")}
                                            id="validators_proposer_default_fee_recipient"
                                            name="validators_proposer_default_fee_recipient"
                                            placeholder="TODO: enter fee recipient address here" />
                                        {errors.validators_proposer_default_fee_recipient ? (
                                            <p className="help is-danger">{errors.validators_proposer_default_fee_recipient.toString()}</p>
                                        ) : null}
                                    </div>
                                </div>
                            </a>



                            <div className="field">
                                <label className="label" htmlFor="mev_boost" >
                                    <Field type="checkbox" id="mev_boost" name="mev_boost" disabled={!installedPackages?.includes("mevboost.avado.dnp.dappnode.eth")}/>
                                    Enable MEV-boost
                                </label>
                                {!installedPackages?.includes("mevboost.avado.dnp.dappnode.eth") && (
                                    <a href="http://my.ava.do/#/installer">Install MEV-Boost package to enable this option</a>
                                )}
                            </div>

                            {isAdminMode && (
                                <div className="field">
                                    <label className="label" htmlFor="network">Network. Only change this if you know what you are doing</label>
                                    <div className="control">
                                        <Field name="network" as="select" className="select">
                                            {supportedNetworks.map(n => <option key={n} value={n} label={n} />)}
                                        </Field>
                                        {values.network !== settings.network ? (
                                            <p className="help is-warning">When the network is changed, Prysm needs to sync to the new network. This can be a long operation. Make sure to update the execution engine too.</p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            <div className="field is-grouped">
                                <div className="control">
                                    <button disabled={!(isValid && dirty)} className="button" onClick={() => applyChanges(values)}>Apply changes</button>
                                </div>
                                <div className="control">
                                    <button disabled={!dirty} className="button is-warning" onClick={() => setValues(settings)}>Revert changes</button>
                                </div>
                                <div className="control">
                                    <div className="button is-danger" onClick={() => confirmResetDefaults()}>Reset defaults</div>
                                </div>
                            </div>

                            {isAdminMode && (
                                <div>
                                    <hr />


                                    <div>
                                        <div className="container">
                                            <pre className="transcript">
                                                Errors : {JSON.stringify(errors)}<br />
                                                Touched : {JSON.stringify(touched)}<br />
                                                Values : {JSON.stringify(values)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Form>
                    }}
                </Formik>
            </div>
        )}
    </>
}

export default Comp;
