import nodeCron from 'node-cron';
import { ControllerAbstract } from '../shared';
import { SCHEDULER_JOBS } from './scheduler.jobs';
import { VideoGeneratorController } from "../video-generator";
import { envConfigs } from '../../configs/env';


export class SchedulerController extends ControllerAbstract {


    async run(): Promise<void> {
        SchedulerController.schedule();

        if(envConfigs.NODE_ENV === 'development') {
            // SchedulerController.runManually();              //TODO => keep this commented
        }
    }


    private static schedule() {
        console.log(`\n>\t Initiating schedules...`);

        for (const schedulerJob of SCHEDULER_JOBS) {
            if (!schedulerJob.scheduled) continue;
            console.log(`✔\t ${schedulerJob.timeString} \t | ${schedulerJob.task}`);
            nodeCron.schedule(schedulerJob.cronExpression, schedulerJob.function, {
                name: schedulerJob.timeString,
                scheduled: schedulerJob.scheduled,
            })
        }

        console.log('\n');
    }

    private static runManually() {
        new VideoGeneratorController().run()
    }
}

