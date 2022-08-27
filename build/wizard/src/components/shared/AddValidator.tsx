import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faEye, faEyeSlash, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { RestApi } from "./RestApi";

interface Props {
    updateValidators: () => void
    keyManagerAPI: RestApi
}

type result = {
    status: "imported" | "duplicate" | "error" | null
    message: string
}

type PassWordFieldType = "text" | "password"

const AddValidator = ({ updateValidators, keyManagerAPI }: Props) => {
    const [keyStoreFile, setKeyStoreFile] = React.useState<File | null>();
    const [password, setPassword] = React.useState<string>("");
    const [passwordFieldType, setPasswordFieldType] = React.useState<PassWordFieldType>("password");
    const [passwordFieldIcon, setPasswordFieldIcon] = React.useState(faEyeSlash);
    const [slashingProtectionFile, setSlashingProtectionFile] = React.useState<File | null>();
    const [addButtonEnabled, setAddButtonEnabled] = React.useState(false);
    const [result, setResult] = React.useState<result>({ status: null, message: "" });

    const [collapsed, setCollapsed] = React.useState(true);

    const addValidator = async () => {
        if (!keyStoreFile) {
            console.log("KeyStoreFile not set")
            setResult({ status: "error", message: "Please check the input files" });
            return
        }

        const createMessage = async () => {
            const keyStore = await keyStoreFile.text();
            const slashingProtection = slashingProtectionFile ? await slashingProtectionFile?.text() : null
            return {
                keystores: [keyStore],
                passwords: [password],
                ...(slashingProtection && { slashing_protection: slashingProtection })
            }
        }

        const message = await createMessage();
        console.log(message)

        keyManagerAPI.post("/eth/v1/keystores", message, (res) => {
            //https://ethereum.github.io/keymanager-APIs/#/Local%20Key%20Manager/ImportKeystores
            const status = res.data.data[0].status

            switch (status) {
                case "imported": setResult({ status: "imported", message: "Successfully imported validator" }); break; //Keystore successfully decrypted and imported to keymanager permanent storage
                case "duplicate": setResult({ status: "duplicate", message: "The imported validator is a duplicate" }); break; //Keystore's pubkey is already known to the keymanager
                case "error":
                default: setResult({ status: "error", message: res.data.data[0].message }); break; // Any other status different to the above: decrypting error, I/O errors, etc.
            }
            updateValidators();
        }, (e) => {
            console.log(e)
            setResult({ status: "error", message: e.message + ". Please check the input files" });
        });
    }

    React.useEffect(() => {
        if (keyStoreFile && password) {
            setAddButtonEnabled(true)
        }
    }, [keyStoreFile, password]);

    const getResultTag = () => {
        switch (result.status) {
            case "duplicate": return "is-warning";
            case "error": return "is-danger";
            default: return "is-success";
        }
    }

    const toggleViewPassword = () => {
        const currentType = passwordFieldType;
        setPasswordFieldType(currentType === "password" ? "text" : "password");
        setPasswordFieldIcon(currentType === "password" ? faEye : faEyeSlash);
    }

    return (
        <div>
            <section className="section">
                <div className="container">
                    <div className="card has-text-black">
                        <header className="card-header" onClick={() => setCollapsed(!collapsed)}>
                            <p className="card-header-title">Add validator</p>
                            <div className="card-header-icon card-toggle">
                                <FontAwesomeIcon icon={collapsed ? faAngleDown : faAngleUp} />
                            </div>
                        </header>
                        <div className={"card-content" + (collapsed ? " is-hidden" : "")}>
                            <div className="content">
                                <div className="field is-horizontal">
                                    <label className="field-label has-text-black">Keystore file (required):</label>
                                    <div className="field-body">
                                        <div className="file has-name">
                                            <label className="file-label"><input className="file-input" type="file" name="keystore" id="keystore" onChange={e => setKeyStoreFile(e.target?.files?.item(0))} />
                                                <span className="file-cta">
                                                    <span className="file-icon">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                    </span>
                                                    <span className="file-label">
                                                        Choose keystore file…
                                                    </span>
                                                </span>
                                                <span className="file-name">
                                                    {keyStoreFile ? keyStoreFile.name : "No file uploaded"}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="field has-addons">
                                    <label className="field-label has-text-black">Password (required):</label>
                                    <div className="field-body">
                                        <div className="control">
                                            <input className="input has-text-black" type={passwordFieldType} onChange={(e) => { setPassword(e.target.value) }} />
                                        </div>
                                        <div className="control">
                                            {/* eslint-disable-next-line */}
                                            <a onClick={toggleViewPassword} className="button"><FontAwesomeIcon
                                                className="icon is-small is-right avadoiconpadding"
                                                icon={passwordFieldIcon}
                                            />
                                            </a></div>
                                    </div>
                                </div>
                                <div className="field is-grouped">
                                    <label className="field-label has-text-black">Slashing protection (optional):</label>
                                    <div className="field-body">
                                        <div className="file has-name">
                                            <label className="file-label">
                                                <input className="file-input" type="file" name="slashing" id="slashing" onChange={e => setSlashingProtectionFile(e.target?.files?.item(0))} />
                                                <span className="file-cta">
                                                    <span className="file-icon">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                    </span>
                                                    <span className="file-label">
                                                        Choose slashing protection file…
                                                    </span>
                                                </span>
                                                <span className="file-name">
                                                    {slashingProtectionFile ? slashingProtectionFile.name : "No file uploaded"}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="field is-grouped">
                                    <label className="field-label has-text-black">{/* Left empty for spacing*/}</label>
                                    <div className="field-body">
                                        <div className="control">
                                            <button className="button is-link" onClick={addValidator} disabled={!addButtonEnabled}>Add validator</button>
                                        </div>
                                        {result.message && (<p className={"tag " + getResultTag()}>{result.message}</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddValidator