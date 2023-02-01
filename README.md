# Big Dink Energy
#### The Portal for Pickleball Play @ The Park

This program automates our Buena Vista Pickleball timeslot scheduling so we can work on our dinks.

### How To

On at least one of our computers we need someone to do the following:

```
crontab -e
```

This will open the crontab file in vim for editing.

Then paste in this line:

```
1 0 * * * node /full/path/to/our/completed/scheduling/script.js
```

This crontab instruction tells the computer to run our scheduler every day at one minute past midnight.

If the computer is asleep or in a low-power state when the cron job is scheduled to run, the job will not run until the next scheduled time, or until the computer wakes up. The cron daemon only runs while the system is up and running, so if the computer is asleep, the cron job will not be executed.

Keep in mind that some operating systems have settings that allow you to schedule the computer to wake up for a brief period in order to run maintenance tasks, such as running cron jobs. You can check the operating system's documentation for more information on how to set this up.

### Credentials

On the machine running the script create a process.env file with the word-of-mouth credentials we agreed upon with the following format:

```
{
    USERNAME: '<email>',
    PASSWORD: '<password>',
}
```

### Logging

