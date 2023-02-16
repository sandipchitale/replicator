import * as readline from 'readline'
import * as child_process from 'child_process';
(async ()=> {

    if (process.argv.length !== 3) {
        console.error('Usage: replicator commandToWrap');
        process.exit(1);
    }

    const commandToWrap = process.argv[2];
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
        } else if (command.match(/^!\d+$/)) {
            const matches = command.match(/^!(\d+)$/);
            command = undefined;
            if (matches && matches.length === 2) {
                try {
                    const commandNumber = parseInt(matches[1]);
                    const historyCommand = history.find(historyItem => historyItem.startsWith(`${commandNumber} >`));
                    if (historyCommand) {
                        console.log(`${historyCommand}\n`);
                        command = historyCommand.replace(`${commandNumber} > ${commandToWrap} `, '');
                    }
                } catch (error: any) {
                }
            }
        }

        try {
            if (command !== undefined) {
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
        } finally {
            commandNumber++;
            commandPrompt.setPrompt(`${commandNumber} > ${commandToWrap} `);
            commandPrompt.prompt();
        }
    });
})();
