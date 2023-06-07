export class DappManagerHelper {
    packageName: string;
    wampSession: any;

    constructor(packageName: string, wampSession: any) {
        this.packageName = packageName;
        this.wampSession = wampSession;
    }

    async dataUriToBlob(dataURI: string) {
        if (!dataURI || typeof dataURI !== "string")
            throw Error("dataUri must be a string");

        // note fetch requires NodeJS 18
        return await (await fetch(dataURI)).blob();
    }

    public getFileContentFromContainer(pathInContainer: string, packageName?: string) {
        const fetchData = async () => {
            const res = JSON.parse(await this.wampSession.call("copyFileFrom.dappmanager.dnp.dappnode.eth", [],
                {
                    id: packageName ?? this.packageName,
                    fromPath: pathInContainer
                }
            ));
            // console.log("result", res)
            if (res.success !== true) return;
            const dataUri = res.result;
            if (!dataUri) return;
            const data = await (await this.dataUriToBlob(dataUri)).text();

            return data
        }
        return fetchData();
    }

    public writeFileToContainer(fileName: string, pathInContainer: string, content: string) {
        if (!this.wampSession)
            return
        const pushData = async () => {
            const base64Data = Buffer.from(content).toString("base64");
            const dataUri = `data:application/json";base64,${base64Data}`
            const res = JSON.parse(await this.wampSession.call("copyFileTo.dappmanager.dnp.dappnode.eth", [],
                {
                    id: this.packageName,
                    dataUri: dataUri,
                    filename: fileName,
                    toPath: pathInContainer
                }));
            console.log("write result", res)
            if (res.success !== true) return;

            return res
        }
        return pushData();
    }

    public getPackages(): Promise<string[]> {
        const fetchData = async () => {
            if (!this.wampSession)
                return []
            const res = JSON.parse(await this.wampSession.call("listPackages.dappmanager.dnp.dappnode.eth"));
            // console.log("result", res)
            if (res.success !== true) return [];

            // console.dir(res)
            const packageNames = res.result
                .filter((r: any) => r.running) // only running packages
                .map((r: any) => r.name) as string[];

            return packageNames;
        }
        return fetchData();
    }


    public getEnvs(): Promise<{ key: string }> {
        const fetchData = async () => {
            if (!this.wampSession)
                return {}
            const res = JSON.parse(await this.wampSession.call("listPackages.dappmanager.dnp.dappnode.eth"));
            // console.log("result", res)
            if (res.success !== true) return {};

            // console.dir(res)
            const envs = res.result.filter((r: any) => r.name === this.packageName)[0]?.envs;
            // console.dir(envs)

            return envs
        }
        return fetchData();
    }

    public writeEnv(key: string, value: string, restart: boolean = false) {
        if (!this.wampSession)
            return
        const pushData = async () => {

            const currentEnvs = await this.getEnvs();

            const newEnvs = { ...currentEnvs, [key]: value }

            const res = JSON.parse(await this.wampSession.call("updatePackageEnv.dappmanager.dnp.dappnode.eth", [],
                {
                    id: this.packageName,
                    envs: newEnvs,
                    restart: restart
                }));

            if (res.success !== true) return;

            console.log("Updated environment variables result. new Value (", key, ":", value, ") ", res.message)
            return res
        }
        return pushData();
    }

    public getLogs() {
        if (!this.wampSession)
            return "Loading..."
        const pushData = async () => {
            const res = JSON.parse(await this.wampSession.call("logPackage.dappmanager.dnp.dappnode.eth", [],
                {
                    id: this.packageName,
                    options: { tail: 20 }
                }));
            if (res.success !== true) return;
            return res.result
        }
        return pushData();
    }

    public restartPackage() {
        if (!this.wampSession)
            return "Loading..."
        const pushData = async () => {
            const res = JSON.parse(await this.wampSession.call("restartPackage.dappmanager.dnp.dappnode.eth", [],
                {
                    id: this.packageName
                }));
            if (res.success !== true) return;
            return res.result
        }
        return pushData();
    }

    public runSigned(cmd: string): Promise<string> {
        const run = async () => {
            if (!this.wampSession)
                return "Failed"

            const res = JSON.parse(await this.wampSession.call("runSignedCmd.dappmanager.dnp.dappnode.eth", [],
                {
                    cmd: cmd
                }
            ));
            console.log("result", res)
            if (res.success !== true) return "Failed";

            return "TODO" //FIXME
        }
        return run();
    }
}