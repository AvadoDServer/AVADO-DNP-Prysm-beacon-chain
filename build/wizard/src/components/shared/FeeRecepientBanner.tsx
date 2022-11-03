import { NavigateFunction } from "react-router-dom";

interface IProps {
    validators_proposer_default_fee_recipient: string | undefined
    navigate: NavigateFunction
}

const FeeRecepientBanner = ({ validators_proposer_default_fee_recipient, navigate }: IProps) => {

    const showWarning = () => {
        return validators_proposer_default_fee_recipient !== undefined && validators_proposer_default_fee_recipient === ""
    }
    return (
        <>
            {showWarning() && (
                <section className="hero is-danger" onClick={() => navigate("/settings#validators_proposer_default_fee_recipient")}>
                    <div className="hero-body is-small">
                         {/* eslint-disable-next-line */}
                        <a className="link" >
                            <p className="has-text-centered">You did not configure a default <em>validator proposal fee recepient yet</em>. Make sure to configure this or you will miss out on rewards.
                            </p>
                        </a>
                    </div>
                </section>
            )}
        </>
    );
};

export default FeeRecepientBanner


