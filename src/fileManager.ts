import jsonfile from 'jsonfile';

// eslint-disable-next-line @typescript-eslint/ban-types
export function readFileSync(location: string): {} {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jsonfile.readFileSync(location);
}
