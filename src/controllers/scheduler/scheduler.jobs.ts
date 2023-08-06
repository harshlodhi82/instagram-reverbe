import { ControllerAbstract } from "../shared";
import { VideoGeneratorController } from "../video-generator";

export const SCHEDULER_JOBS: ISchedulerJobs[] = [
    {
        cronExpression: '* * * * * ',
        timeString: 'every 1 minute',
        description: 'This cron runs every second',
        scheduled: true,
        function: new VideoGeneratorController().run,
        task: 'Generate reel and upload it to instagram'
    }
]


interface ISchedulerJobs {
    timeString: string;
    cronExpression: string;
    description: string;
    scheduled: boolean;
    function: ControllerAbstract['run'],
    task: string;
}
