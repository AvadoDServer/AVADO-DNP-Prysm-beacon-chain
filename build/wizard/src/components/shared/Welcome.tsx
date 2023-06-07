import React from "react";
import { Link } from "react-router-dom";
import { DappManagerHelper } from "./DappManagerHelper";
import { logo } from "../Logo"

interface Props {
    title: string
    dappManagerHelper: DappManagerHelper
}

const Welcome = ({ title, dappManagerHelper }: Props) => {

    return (
        <div>
            <div className="container has-text-centered ">
                <div className="columns is-vcentered">
                    <div className="column">
                        <figure className="image is-64x64 is-inline-block">
                            <img src={logo} alt={`${title} logo`} />
                        </figure>
                        <div className="content">

                            <h1 className="title has-text-black is-2">Welcome to {title}</h1>
                            {
                                !dappManagerHelper ? (
                                    <p>loading...</p>
                                ) : (
                                    <>
                                        <p>Welcome to {title}. It might take some time for the beacon chain to initialize.</p>
                                        <p>Once {title} has initialized succesfully, it's status will appear in the top right.</p>
                                        <br />
                                        <p>While you are waiting, now is a good time to check the <b>Settings</b>.<br/>
                                        Make sure the <code>Fee Recipient address</code> has your address!</p>

                                        <Link to="/settings" className="button">Open Settings</Link>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Welcome


