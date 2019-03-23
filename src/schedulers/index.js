import schedule from 'node-schedule';
import Senat from "./senat.fr";

const scheduler = {
  schedule: () => {
    schedule.scheduleJob(Senat.scheduleRule, Senat.getItems());
  }
};

export default scheduler;
