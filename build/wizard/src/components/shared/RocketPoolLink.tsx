import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ValidatorData } from "./Validators";
import axios from "axios";
import { Network } from "./Types";

interface Props {
    validator: ValidatorData,
    network: Network
}

const RocketPoolLink = ({ validator, network }: Props) => {

    const [minipool, setMinipool] = useState<string>();

    const apiUrl = () => {
        switch (network) {
            case "prater": return "https://prater.beaconcha.in"
            case "gnosis": return "https://beacon.gnosischain.com"
            default: return "https://beaconcha.in"
        }
    }

    const rocketscanUrl = () => {
        switch (network) {
            case "prater": return "https://prater.rocketscan.io"
            case "gnosis": return ""
            default: return "https://rocketscan.io"
        }
    }

    useEffect(() => {
        axios.get(`${apiUrl()}/api/v1/rocketpool/validator/${validator.validator.pubkey}`).then((res) => {
            const result = res.data;
            if (result.status === "OK") {
                setMinipool(result.data.minipool_address)
            }
        })
    }, [validator]);

    const minipoolAddress = (minipool: string) => `${rocketscanUrl()}/minipool/${minipool}`

    if (!minipool)
        return <></>

    return <a href={minipoolAddress(minipool)}>
        <span className="icon has-text-info">
            <FontAwesomeIcon icon={faRocket} />
        </span>
    </a>
};

export default RocketPoolLink
