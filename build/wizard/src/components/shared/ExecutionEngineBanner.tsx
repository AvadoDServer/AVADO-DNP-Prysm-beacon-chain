interface IProps {
    execution_engine:  string | undefined,    
    installedPackages: string[] | undefined
    wikilink: string
    client: string
}

const ExecutionEngineBanner = ({ execution_engine, installedPackages, wikilink, client }: IProps) => {

    const isAvailable = () => {
        // console.log(installedPackages)
        // console.log(execution_engine)
        if (!installedPackages || !execution_engine) {
            return true; // not initialized yet
        }
        return installedPackages.includes(execution_engine)
        
    }

    return (
        <>
            {!isAvailable() && (
                <section className="hero is-danger">
                    <div className="hero-body is-small">
                         {/* eslint-disable-next-line */}
                         <a href={wikilink}>
                            <p className="has-text-centered">You did not install an execution client yet. This is required for {client} to work.
                            </p>                        
                        </a>
                    </div>
                </section>
            )}
        </>
    );
};

export default ExecutionEngineBanner


