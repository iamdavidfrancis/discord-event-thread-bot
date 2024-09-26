# Discord Event Thread Bot

[![Publish Docker Image](https://github.com/iamdavidfrancis/discord-event-thread-bot/actions/workflows/publish-docker.yml/badge.svg?branch=main)](https://github.com/iamdavidfrancis/discord-event-thread-bot/actions/workflows/publish-docker.yml)

Allows users to create threads for their events easily. Still very much a Proof of Concept.

**Note:** This doesn't use the "Events" feature in Discord. This simply makes threads in a channel and posts and embed with event details.

This is mostly a learning exercise because I was bored. Don't expect great things here.

## Usage

### Configuration

Once the bot is installed, you should configure the channel it will create threads under via the `/config set-channel` command. The bot will respond if this succeeds:

![Screenshot ](assets/set-channel-message.png)

### Creating Events

Once the bot is configured, you can use the `/event` command to create a new event. The command has several options that can be set:

| Option        | Required? | Description                                                                                                                                                               |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Yes       | The name of the event.                                                                                                                                                    |
| `description` | No        | More detail about the event. If this is omitted, the bot will construct a description from the other information provided.                                                |
| `date`        | No        | The date of the event. Can use a date string like `2024-09-30T18:00:00Z` or natural language like `This saturday from 6pm to 9pm PST`. Note: The default timezone is UTC, but it will honor a timezone if you include one. |
| `attachment`  | No        | This can be a flyer or some other image associated with the event. It will be added to the embed in the thread.                                                           |

Here's an example of the command:

![/event command with a title, description, and date](assets/create-event-command.png)

Once the command is run you will see a reply in the channel you sent the message from, and the thread will be created. Here's an example command:
```
/event name:Backyard BBQ date:This saturday from 6pm to 9pm PDT description:Lets get some food on the grill and hang out with friends.
```

The response from the bot:

![The response from the bot with a link to the thread.](assets/create-event-response.png)

Clicking on the link will take you to the thread:

![alt text](assets/event-thread.png)