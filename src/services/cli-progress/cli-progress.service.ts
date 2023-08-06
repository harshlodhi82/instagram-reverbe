import cliProgress from 'cli-progress';


export class CliProgressService{

    static createProgress(message: string): cliProgress.SingleBar {
        console.log(message);
        const progressBar: cliProgress.SingleBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        return progressBar;
    }

    static start(progressBar: cliProgress.SingleBar, max: number, min: number){
        progressBar.start(max, min);
    }

    static update (progressBar: cliProgress.SingleBar, update: number){
        progressBar.update(update);
        
    }

    static stop(progressBar: cliProgress.SingleBar, max: number) {
        CliProgressService.update(progressBar, max);
        progressBar.stop();
    }
}
