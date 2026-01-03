import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'node:url';

// 1. Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, '../../src/python-scripts/fetch_servings.py');

interface Serving {
  date: string,
  food: string,
  amount: number
}

async function fetchServings(userEmail: string, userPassword: string): Promise<Serving[]> {
  return new Promise((resolve, reject) => {
    const pythonScript = spawn('python3', [scriptPath, userEmail, userPassword]);

    // capture output printed from python script, resolve promise
    // TO DO: need to define servings data type somewhere cronometer-service and auth-controller can see it
    pythonScript.stdout.on('data', (servingsBuffer: Buffer) => {
      console.log(`fetch_servings_data.py stdout: ${servingsBuffer.toString()}`);

      // convert servings from buffer to array of serving objects
      const servings: Serving[] = JSON.parse(servingsBuffer.toString());

      // validate servings
      for (let serving of servings) {
        // test for date in YYYY-MM-DD form
        const validDate: RegExp = /^([0-9]{4})-(0[1-9]|1[0-2]|[1-9])-([1-9]|0[1-9]|[1-2]\d|3[0-1])$/;
        if (!validDate.test(serving.date)) {
          reject('servings form invalid (invalid date form)');
        }
        if (!(/^.+$/.test(serving.food) && typeof serving.food === 'string')) {
          reject('servings form invalid (invalid food form)');
        }
        if (!(typeof serving.amount === 'number')) {
          reject('servings form invalid (invalid amount form)');
        }
        
      }
      resolve(servings);
    });

    // capture errors from python script, reject promise
    pythonScript.stderr.on('data', (error) => {
      console.error(`fetch_servings_data.py stderr: ${error.toString()}`);

      reject(error);
    });

    // listen for script to close
    pythonScript.on('close', (code) => {
      console.log(`fetch_servings_data.py exited with code ${code}`);
    });

    // handle potential errors during spawn
    pythonScript.on('error', (err) => {
      console.error('failed to start fetch_servings_data.py:', err);
    });

    // close after 15 seconds
    setTimeout(() => {
      console.log('Killing fetch_servings_data.py...');

      // Send a SIGTERM signal
      pythonScript.kill('SIGTERM');

    }, 15000);

  });
}

export default {
  fetchServings
};