import * as readline from 'readline'
import * as child_process from 'child_process';
(async ()=> {

    if (process.argv.length !== 3) {
        console.error('Usage: replicator commandToWrap');
        console.error('       commandToWrap can use _ in place of spaces and will be replaced with spaces');
        process.exit(1);
    }

    const commandToWrap = process.argv[2].replace(/_/g, ' ');
    console.log(commandToWrap);

    const commandPrompt = readline.createInterface({
        prompt: '> ${commandToWrap} ',
        historySize: 1000,
        input: process.stdin,
        output: process.stdout,
    });
    let history = [];
    let commandNumber = 1;
    commandPrompt.setPrompt(`${commandNumber} > ${commandToWrap} `);
    commandPrompt.prompt();
    commandPrompt.on('line', command => {
        command = command.trim();
        if (command === 'exit') {
            commandPrompt.close();
            return;
        }

        if (command === 'history') {
            history.forEach((command: string) => {
                console.log(command);
            });
            commandPrompt.prompt();
            return;
        } else if (command.match(/^!(\d+|!).*$/)) {
            const matches = command.match(/^!(\d+|!)(.*)$/);
            command = undefined;
            if (matches && matches.length >= 2) {
                try {
                    let historyCommand;
                    let localCommandNumber;
                    if (matches[1] === '!') {
                        localCommandNumber = history.length;
                        historyCommand = history[localCommandNumber - 1];
                    } else {
                        localCommandNumber = parseInt(matches[1]);
                        historyCommand = history.find(historyItem => historyItem.startsWith(`${localCommandNumber} >`));
                    }
                    if (matches.length === 3) {
                        historyCommand += `${matches[2]}`;
                    }
                    if (historyCommand) {
                        console.log(`${historyCommand}\n`);
                        command = historyCommand.replace(`${localCommandNumber} > ${commandToWrap} `, '');
                    }
                } catch (error: any) {
                }
            }
        }

        try {
            if (command !== undefined) {
                if (command === '') {
                    // do nothing
                } else {
                    try {
                        history.push(`${commandNumber} > ${commandToWrap} ${command}`);
                        const commandResult = child_process.execSync(`${commandToWrap} ${command}`, { encoding: 'utf8' });
                        if (commandResult) {
                            console.log(commandResult);
                        }
                    } catch (error: any) {
                        console.error(error.stderr);
                    }
                }
            }
        } finally {
            if (command !== '') {
                commandNumber++;
                commandPrompt.setPrompt(`${commandNumber} > ${commandToWrap} `);
            }
            commandPrompt.prompt();
        }
    });
})();
